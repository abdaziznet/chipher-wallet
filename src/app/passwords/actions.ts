
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

export async function addPasswordAction(
  newPassword: Omit<PasswordEntry, 'id' | 'userId'>
): Promise<ActionResult> {
  try {
    // This is a placeholder for getting the current user's ID
    // In a real app, you would get this from the session
    const cookies = (await import('next/headers')).cookies;
    const currentUserId = JSON.parse(cookies().get('cipherwallet-auth-current-user-id')?.value || 'null');

    if (!currentUserId) {
      return { error: 'User not authenticated.' };
    }
    
    await addPassword({ ...newPassword, userId: currentUserId });
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
    await updatePassword(updatedPassword);
    return { message: 'Password updated successfully.' };
  } catch (error) {
    console.error('Failed to update password:', error);
    return { error: 'Failed to update password.' };
  }
}

export async function deletePasswordAction(id: string): Promise<ActionResult> {
  try {
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
       // Cannot prompt from server action. This flow is simplified.
       // In a real app, you might handle key input on the client.
       // Here we assume the standard encryption key is used if any.
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
          // If one fails, maybe it wasn't encrypted, try using as is.
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
        await updatePassword(fullEntry as PasswordEntry);
      } else {
        delete fullEntry.id;
        await addPassword(fullEntry as Omit<PasswordEntry, 'id'>);
      }
    }

    return { message: `${importedPasswords.length} passwords have been processed.` };
  } catch (error) {
    console.error('Failed to import file:', error);
    return { error: error instanceof Error ? error.message : 'Could not parse the file.' };
  }
};
