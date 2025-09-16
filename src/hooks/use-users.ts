
'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = 'cipherwallet-users';
const CURRENT_USER_ID_STORAGE_KEY = 'cipherwallet-current-user-id';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

// This default user will be created on first load if no users exist.
// The password is 'admin'.
const defaultAdmin: User = {
  id: 'admin_01',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  password: CryptoJS.AES.encrypt('admin', ENCRYPTION_KEY).toString(),
};

export function useUsers() {
  const [users, setUsersState] = React.useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        setUsersState(JSON.parse(savedUsers));
      } else {
        setUsersState([defaultAdmin]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
      }

      const savedCurrentUserId = localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
      if (savedCurrentUserId) {
        setCurrentUserIdState(JSON.parse(savedCurrentUserId));
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
      setUsersState([defaultAdmin]);
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
      }
       window.location.href = userId ? '/' : '/login';
    } catch (error) {
      console.error('Failed to save current user ID to localStorage', error);
    }
  };

  const currentUser = React.useMemo(() => {
    return users.find(u => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  return { users, setUsers, currentUser, setCurrentUserId, isLoaded };
}
