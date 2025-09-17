
'use server';

import {
  addPassword,
  updatePassword,
  deletePassword,
  deletePasswords,
  getPasswords,
} from '@/ai/flows/passwords-flow';
import type { PasswordEntry } from '@/lib/types';
import * as yaml from 'js-yaml';
import * as CryptoJS from 'crypto-js';

type ActionResult = {
  error?: string;
  message?: string;
};

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';


export async function addPasswordAction(
  newPassword: Omit<PasswordEntry, 'id'>
): Promise<ActionResult> {
  try {
    if (!newPassword.userId) {
      return { error: 'User not authenticated.' };
    }

    const encryptedPassword = CryptoJS.AES.encrypt(newPassword.password, ENCRYPTION_KEY).toString();
    
    await addPassword({ ...newPassword, password: encryptedPassword });
    return { message: 'Password added successfully.' };
  } catch (error) {
    console.error('Failed to add password:', error);
    return { error: 'Failed to add password.' };
  }
}

export async function updatePasswordAction(
  updatedPassword: PasswordEntry
): Promise<ActionResult> {
  try {
     if (!updatedPassword.userId) {
      return { error: 'User not authenticated or unauthorized.' };
    }

    // Assume the password might not be encrypted if it's being updated from the form.
    // A more robust solution might check if it's already encrypted.
    const encryptedPassword = CryptoJS.AES.encrypt(updatedPassword.password, ENCRYPTION_KEY).toString();

    await updatePassword({ ...updatedPassword, password: encryptedPassword });
    return { message: 'Password updated successfully.' };
  } catch (error) {
    console.error('Failed to update password:', error);
    return { error: 'Failed to update password.' };
  }
}

export async function deletePasswordAction(id: string): Promise<ActionResult> {
  try {
    // In a real app, you'd verify ownership before deleting.
    // The flow in a real app would receive the userId.
    await deletePassword(id);
    return { message: 'Password deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete password:', error);
    return { error: 'Failed to delete password.' };
  }
}

export async function deletePasswordsAction(ids: string[]): Promise<ActionResult> {
    try {
        await deletePasswords(ids);
        return { message: 'Passwords deleted successfully.' };
    } catch (error) {
        console.error('Failed to delete passwords:', error);
        return { error: 'Failed to delete passwords.' };
    }
}

interface ImportInput {
  fileContent: string;
  fileName: string;
  userId: string;
}

export async function importPasswordsAction(input: ImportInput): Promise<ActionResult> {
  const { fileContent, fileName, userId } = input;
   if (!userId) {
      return { error: 'User not authenticated.' };
    }
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  try {
    let importedPasswords: Partial<PasswordEntry>[] = [];

    if (fileExtension === 'json') {
      importedPasswords = JSON.parse(fileContent);
    } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
      importedPasswords = yaml.load(fileContent) as Partial<PasswordEntry>[];
    } else if (fileExtension === 'csv') {
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      const headerLine = lines.shift();
      if (!headerLine) throw new Error('CSV file is empty or has no header.');
      
      const header = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
      
      importedPasswords = lines.map((line) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const entryData: {[key: string]: string} = {};
        header.forEach((h, i) => {
          entryData[h] = values[i] || '';
        });

        return entryData as Partial<PasswordEntry>;
      });
    } else {
      throw new Error('Unsupported file format. Please use CSV, JSON, or YAML.');
    }

    const firstPassword = importedPasswords.find(p => p.password)?.password;
    const isLikelyEncrypted = firstPassword && (firstPassword.startsWith('U2FsdGVk') || firstPassword.length > 50);

    let decryptionKey = '';
    if (isLikelyEncrypted) {
       decryptionKey = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key'
    }
    
    const existingPasswords = await getPasswords(userId);
    const existingIds = new Set(existingPasswords.map(p => p.id));
    
    for (const entry of importedPasswords) {
      if (!entry.appName || !entry.username || !entry.password) {
        console.warn(`Skipping invalid entry`);
        continue;
      }

      let decryptedPassword = entry.password;
      if (decryptionKey && isLikelyEncrypted) {
        try {
          const bytes = CryptoJS.AES.decrypt(entry.password, decryptionKey);
          decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedPassword) {
              throw new Error(`Decryption failed for an entry. Please check your key.`);
          }
        } catch (err) {
          decryptedPassword = entry.password;
        }
      }
      
      const fullEntry: Omit<PasswordEntry, 'id'> & { id?: string } = {
        id: entry.id,
        appName: entry.appName,
        username: entry.username,
        password: decryptedPassword,
        website: entry.website || '',
        userId: userId,
      };

      if (fullEntry.id && existingIds.has(fullEntry.id)) {
        await updatePasswordAction(fullEntry as PasswordEntry);
      } else {
        delete fullEntry.id;
        await addPasswordAction(fullEntry as Omit<PasswordEntry, 'id'>);
      }
    }

    return { message: `${importedPasswords.length} passwords have been processed.` };
  } catch (error) {
    console.error('Failed to import file:', error);
    return { error: error instanceof Error ? error.message : 'Could not parse the file.' };
  }
};
