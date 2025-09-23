
'use server';

import {
  addPassword,
  updatePassword,
  deletePassword,
  deletePasswords,
  getPasswords,
} from '@/ai/flows/passwords-flow';
import type { PasswordEntry } from '@/lib/types';
import * as CryptoJS from 'crypto-js';

type ActionResult = {
  error?: string;
  message?: string;
};

export async function addPasswordAction(
  newPassword: Omit<PasswordEntry, 'id'> & { secretKey: string }
): Promise<ActionResult> {
  try {
    if (!newPassword.userId) {
      return { error: 'User not authenticated.' };
    }

    if (!newPassword.secretKey) {
        return { error: 'Secret key is required.' };
    }

    const existingPasswords = await getPasswords(newPassword.userId);
    const isDuplicate = existingPasswords.some(
      p => p.appName.toLowerCase() === newPassword.appName.toLowerCase() && 
           p.username.toLowerCase() === newPassword.username.toLowerCase()
    );

    if (isDuplicate) {
      return { error: 'A password for this app name and username already exists.' };
    }

    const encryptedPassword = CryptoJS.AES.encrypt(newPassword.password, newPassword.secretKey).toString();
    
    // Do not store the secret key
    const { secretKey, ...passwordData } = newPassword;
    await addPassword({ ...passwordData, password: encryptedPassword });

    return { message: 'Password added successfully.' };
  } catch (error) {
    console.error('Failed to add password:', error);
    return { error: 'Failed to add password.' };
  }
}

export async function updatePasswordAction(
  updatedPassword: PasswordEntry,
  secretKey: string
): Promise<ActionResult> {
  try {
     if (!updatedPassword.userId) {
      return { error: 'User not authenticated or unauthorized.' };
    }

    if (!secretKey) {
      return { error: 'Secret key is required.' };
    }

    const encryptedPassword = CryptoJS.AES.encrypt(updatedPassword.password, secretKey).toString();

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
