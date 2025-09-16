
'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUsers } from '@/hooks/use-users';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

export default function LoginPage() {
  const { users, setCurrentUserId, currentUser } = useUsers();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find((u) => u.name.toLowerCase() === username.toLowerCase());

    if (!user) {
      setError('Invalid username or password.');
      return;
    }

    let decryptedPassword = '';
    if (user.password) {
        try {
            const bytes = CryptoJS.AES.decrypt(user.password, ENCRYPTION_KEY);
            decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error('Decryption failed', e);
            setError('An error occurred during login.');
            return;
        }
    }

    if (decryptedPassword === password) {
      setCurrentUserId(user.id);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleLogin}>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
               <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to CipherWallet</CardTitle>
            <CardDescription>Enter your credentials to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={!username || !password}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
