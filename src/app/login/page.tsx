
'use client';

import * as React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { users, setCurrentUserId, currentUser } = useUsers();
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      setCurrentUserId(selectedUserId);
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
            <CardDescription>Select a profile to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">User Profile</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">({user.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={!selectedUserId}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
