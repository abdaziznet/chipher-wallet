
'use client';

import * as React from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface SessionContextType {
  currentUser: User | null;
  isLoaded: boolean;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

// Mapping of Firebase user UIDs to roles.
// In a real application, this should come from a secure backend.
const userRoles: { [uid: string]: 'admin' | 'guest' } = {
  // Replace with the Firebase UID of your admin user after they sign in once.
  // 'FIREBASE_UID_OF_ADMIN': 'admin',
};


export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const role = userRoles[firebaseUser.uid] || 'guest';
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: role,
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoaded(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoaded,
    // The following are no longer needed but kept for compatibility to avoid breaking other components immediately.
    // They should be removed in a follow-up refactoring.
    users: currentUser ? [currentUser] : [],
    setUsers: () => {},
    setCurrentUserId: () => {},
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
