
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
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'your-secret-key-here';
// Static admin user: username 'abdaziz', password 'Biidznill@hAMS157'
const STATIC_ADMIN_USERNAME = 'abdaziz';
const STATIC_ADMIN_PASSWORD = 'Biidznill@hAMS157';

export default function LoginPage() {
  const { users, setCurrentUserId, currentUser } = useUsers();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Handle static admin login
    if (username.toLowerCase() === STATIC_ADMIN_USERNAME) {
      if (password === STATIC_ADMIN_PASSWORD) {
        setCurrentUserId('static_admin'); // Use a special ID for the static admin
      } else {
        setError('Invalid username or password.');
      }
      return;
    }

    // Handle guest user login
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
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
