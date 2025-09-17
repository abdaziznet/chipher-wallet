
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { currentUser } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="grid gap-2">
            <h1 className="text-3xl font-bold font-headline">Manage Users</h1>
            <p className="text-muted-foreground">
              User management is now handled through Firebase Authentication.
            </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Firebase User Management</CardTitle>
          <CardDescription>
            To add, edit, or remove users, please visit your Firebase project console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You can manage all users who sign in with Google from the Authentication section of the Firebase console.
          </p>
          <a href={`https://console.firebase.google.com/project/studio-9022282456-2408f/authentication/users`} target="_blank" rel="noopener noreferrer">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Go to Firebase Console
            </button>
          </a>
        </CardContent>
      </Card>
    </>
  );
}
