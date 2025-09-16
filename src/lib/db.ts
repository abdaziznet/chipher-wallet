// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import type { PasswordEntry } from './types';

const DB_PATH = '/cipherwallet.db';

export function useDb() {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<any>(null);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
        
        // Try to fetch existing DB from public folder
        const response = await fetch(DB_PATH).catch(() => null);
        
        let dbInstance;
        if (response && response.ok) {
          const buffer = await response.arrayBuffer();
          dbInstance = new SQL.Database(new Uint8Array(buffer));
        } else {
          dbInstance = new SQL.Database();
          // Create table if it's a new database
          const query = `
            CREATE TABLE passwords (
              id TEXT PRIMARY KEY,
              appName TEXT NOT NULL,
              username TEXT NOT NULL,
              password TEXT NOT NULL,
              website TEXT
            );`;
          dbInstance.exec(query);
        }

        setDb(dbInstance);

      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err);
      }
    };
    loadDb();
  }, []);

  const getPasswords = (): PasswordEntry[] => {
    if (!db) return [];
    try {
      const res = db.exec("SELECT * FROM passwords ORDER BY appName ASC");
      if (res.length === 0) return [];
      
      const columns = res[0].columns;
      return res[0].values.map(row => {
        const entry: any = {};
        columns.forEach((col, i) => {
          entry[col] = row[i];
        });
        return entry as PasswordEntry;
      });
    } catch (err) {
      console.error('Failed to get passwords:', err);
      return [];
    }
  };

  const addPassword = (entry: Omit<PasswordEntry, 'id'>): PasswordEntry => {
    if (!db) throw new Error('Database not initialized');
    const id = `pw_${Date.now()}`;
    const newEntry = { ...entry, id };
    try {
      db.run("INSERT INTO passwords (id, appName, username, password, website) VALUES (?, ?, ?, ?, ?)", [
        newEntry.id,
        newEntry.appName,
        newEntry.username,
        newEntry.password,
        newEntry.website || null,
      ]);
      return newEntry;
    } catch (err) {
      console.error('Failed to add password:', err);
      throw err;
    }
  };
  
  const updatePassword = (entry: PasswordEntry): PasswordEntry => {
    if (!db) throw new Error('Database not initialized');
    try {
      db.run("UPDATE passwords SET appName = ?, username = ?, password = ?, website = ? WHERE id = ?", [
        entry.appName,
        entry.username,
        entry.password,
        entry.website || null,
        entry.id,
      ]);
      return entry;
    } catch (err) {
      console.error('Failed to update password:', err);
      throw err;
    }
  };
  
  const deletePassword = (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    try {
      db.run("DELETE FROM passwords WHERE id = ?", [id]);
    } catch (err) {
      console.error('Failed to delete password:', err);
      throw err;
    }
  };
  
  const bulkInsertOrUpdate = (passwords: PasswordEntry[]) => {
    if (!db) throw new Error("Database not initialized");
    const insertStmt = db.prepare("INSERT OR IGNORE INTO passwords (id, appName, username, password, website) VALUES (?, ?, ?, ?, ?)");
    const updateStmt = db.prepare("UPDATE passwords SET appName = ?, username = ?, password = ?, website = ? WHERE id = ?");

    passwords.forEach(p => {
        // Try inserting first
        insertStmt.run([p.id, p.appName, p.username, p.password, p.website || null]);
        // Then try updating, which will only affect rows where the ID already existed.
        updateStmt.run([p.appName, p.username, p.password, p.website || null, p.id]);
    });

    insertStmt.free();
    updateStmt.free();
  };

  const exportDb = (): Uint8Array | null => {
    if (!db) return null;
    return db.export();
  };

  return { db, error, getPasswords, addPassword, updatePassword, deletePassword, bulkInsertOrUpdate, exportDb };
}
