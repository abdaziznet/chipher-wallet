
'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const USERS_STORAGE_KEY = 'cipherwallet-auth-users';
const CURRENT_USER_ID_STORAGE_KEY = 'cipherwallet-auth-current-user-id';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

// This default user will be created on first load if no users exist.
// The password is 'guest'.
const defaultGuest: User = {
  id: 'guest_01',
  name: 'Guest',
  email: 'guest@example.com',
  role: 'guest',
  password: CryptoJS.AES.encrypt('guest', ENCRYPTION_KEY).toString(),
};

const staticAdminUser: User = {
  id: 'static_admin',
  name: 'abdaziz',
  email: 'admin@static.com',
  role: 'admin',
};


export function useUsers() {
  const [users, setUsersState] = React.useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        setUsersState(JSON.parse(savedUsers));
      } else {
        // On first load, if no users, set a default guest.
        setUsersState([defaultGuest]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultGuest]));
      }

      const savedCurrentUserId = localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
      if (savedCurrentUserId) {
        setCurrentUserIdState(JSON.parse(savedCurrentUserId));
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
      setUsersState([defaultGuest]);
      setCurrentUserIdState(null);
    }
    setIsLoaded(true);
  }, []);

  const setUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    } catch (error) {
      console.error('Failed to save users to localStorage', error);
    }
  };

  const setCurrentUserId = (userId: string | null) => {
    setCurrentUserIdState(userId);
    try {
      if (userId) {
        localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, JSON.stringify(userId));
      } else {
        localStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY);
        // The redirect is now handled by the RootLayout
      }
    } catch (error) {
      console.error('Failed to save current user ID to localStorage', error);
    }
  };

  const currentUser = React.useMemo(() => {
    if (currentUserId === staticAdminUser.id) {
      return staticAdminUser;
    }
    return users.find(u => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const allUsers = users;

  return { users: allUsers, setUsers, currentUser, setCurrentUserId, isLoaded };
}
