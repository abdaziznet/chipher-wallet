
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const { currentUser } = useSession();
  const [error, setError] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // The user closed the popup, so we don't need to show an error.
        return;
      }
      console.error('Google Sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Image
              src="https://i.imgur.com/Q7axrSm.png"
              alt="CipherWallet Logo"
              width={48}
              height={48}
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to CipherWallet</CardTitle>
          <CardDescription>Sign in with your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c73 0 135.3 29.1 181.8 74.3L363.5 158.5c-24.6-23.3-58.3-38.3-99.5-38.3-83.3 0-151.3 65.2-151.3 145.8s68 145.8 151.3 145.8c95.3 0 128.8-66.3 133.5-100.9H244v-64.8h243.2c1.3 12.6 3.2 25.3 3.2 39.9z"></path>
            </svg>
            Sign in with Google
          </Button>
          {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
