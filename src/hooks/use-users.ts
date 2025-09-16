
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = 'cipherwallet-users';
const CURRENT_USER_ID_STORAGE_KEY = 'cipherwallet-current-user-id';

const defaultSuperAdmin: User = {
  id: 'superadmin_01',
  name: 'Super Admin',
  email: 'admin@example.com',
  role: 'superadmin',
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
        // Initialize with default super admin if no users are saved
        setUsersState([defaultSuperAdmin]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultSuperAdmin]));
      }

      const savedCurrentUserId = localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
      if (savedCurrentUserId) {
        setCurrentUserIdState(JSON.parse(savedCurrentUserId));
      } else {
        // Default to super admin if no current user is set
        setCurrentUserIdState(defaultSuperAdmin.id);
        localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, JSON.stringify(defaultSuperAdmin.id));
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
      // Fallback to defaults
      setUsersState([defaultSuperAdmin]);
      setCurrentUserIdState(defaultSuperAdmin.id);
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
      // Reload to reflect changes across the app
       window.location.reload();
    } catch (error) {
      console.error('Failed to save current user ID to localStorage', error);
    }
  };

  const currentUser = React.useMemo(() => {
    return users.find(u => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  return { users, setUsers, currentUser, setCurrentUserId, isLoaded };
}
