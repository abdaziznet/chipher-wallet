
'use server';

import * as CryptoJS from 'crypto-js';
import { z } from 'zod';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = 'cipherwallet-auth-users';
const CURRENT_USER_ID_STORAGE_KEY = 'cipherwallet-auth-current-user-id';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';


const formSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
});

type State = {
  error?: string;
  success?: string;
};

// This is a workaround to get user data in a server action.
// In a real app, you would fetch this from a database.
const getUsersFromCookie = (): User[] => {
  const cookieStore = cookies();
  // This is a bit of a hack. We're passing user data via cookies
  // because we don't have a database. This is NOT recommended for production.
  const usersCookie = cookieStore.get('users_for_actions');
  if (usersCookie?.value) {
    try {
      return JSON.parse(usersCookie.value);
    } catch {
      return [];
    }
  }
  return [];
};


export async function updatePasswordAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const data = Object.fromEntries(formData);
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    const errorMessages = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errorMessages)[0]?.[0];
    return { error: firstError || 'Invalid form data.' };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const cookieStore = cookies();
    const currentUserIdCookie = cookieStore.get(CURRENT_USER_ID_STORAGE_KEY);
    const currentUserId = currentUserIdCookie ? JSON.parse(currentUserIdCookie.value) : null;
    
    if (!currentUserId) {
      return { error: 'No user is currently logged in.' };
    }

    const savedUsers = cookieStore.get(USERS_STORAGE_KEY);
    let users: User[] = savedUsers ? JSON.parse(savedUsers.value) : [];

    const userIndex = users.findIndex(u => u.id === currentUserId);
    const user = userIndex !== -1 ? users[userIndex] : null;

    if (!user || !user.password) {
      return { error: 'Could not find user or user has no password.' };
    }
    
    if (user.role === 'admin') {
      return { error: 'Admin password cannot be changed here.' };
    }

    let decryptedPassword = '';
    try {
        const bytes = CryptoJS.AES.decrypt(user.password, ENCRYPTION_KEY);
        decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error('Decryption failed', e);
        return { error: 'An error occurred while verifying your password.' };
    }

    if (decryptedPassword !== currentPassword) {
      return { error: 'Incorrect current password.' };
    }

    const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, ENCRYPTION_KEY).toString();
    
    const updatedUser = { ...user, password: encryptedNewPassword };
    users[userIndex] = updatedUser;

    // This is a workaround to update localStorage from a server action via cookies.
    cookieStore.set(USERS_STORAGE_KEY, JSON.stringify(users), { path: '/' });
    
    return { success: 'Password updated successfully.' };

  } catch (error) {
    console.error('Password update failed:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
