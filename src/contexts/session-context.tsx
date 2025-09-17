
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

// The email address for the admin user.
const ADMIN_EMAIL = 'file.azis@gmail.com';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Determine role based on email address.
        const role = firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'guest';
        
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL,
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
