
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { useUsers } from '@/hooks/use-users';

interface SessionContextType {
  currentUser: User | null;
  users: User[];
  setUsers: (users: User[]) => void;
  setCurrentUserId: (userId: string | null) => void;
  isLoaded: boolean;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { users, setUsers, currentUser, setCurrentUserId, isLoaded } = useUsers();

  const value = {
    currentUser,
    users,
    setUsers,
    setCurrentUserId,
    isLoaded,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
