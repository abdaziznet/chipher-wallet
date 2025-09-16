
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = 'cipherwallet-auth-users';
const CURRENT_USER_ID_STORAGE_KEY = 'cipherwallet-auth-current-user-id';

// This default user will be created on first load if no users exist.
const defaultGuest: Omit<User, 'id'> = {
  name: 'Guest',
  email: 'guest@example.com',
  role: 'guest',
  password: 'default-guest-password-should-be-encrypted', // This should be handled properly on creation
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

  React.useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        setUsersState(JSON.parse(savedUsers));
      } else {
        // On first load, if no users, set a default guest.
        const initialGuest = { ...defaultGuest, id: 'guest_01' };
        // Note: In a real app, you would securely encrypt the default password.
        // For this context, we assume the add-user flow handles encryption.
        // Here, we're just setting up initial data.
        setUsersState([initialGuest]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([initialGuest]));
      }

      const savedCurrentUserId = localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
      if (savedCurrentUserId) {
        setCurrentUserIdState(JSON.parse(savedCurrentUserId));
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
      const initialGuest = { ...defaultGuest, id: 'guest_01' };
      setUsersState([initialGuest]);
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

  const allUsers = React.useMemo(() => {
    // Avoid duplicates if static admin is somehow in the stored users
    const filteredUsers = users.filter(u => u.id !== staticAdminUser.id);
    return [staticAdminUser, ...filteredUsers];
  }, [users]);


  return { users: allUsers, setUsers, currentUser, setCurrentUserId, isLoaded };
}
