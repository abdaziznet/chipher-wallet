
'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

interface AddUserDialogProps {
  children: React.ReactNode;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
}

export function AddUserDialog({ children, onAddUser }: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Password Required',
        description: 'Please enter a password for the new user.',
      });
      return;
    }

    const newUser: Omit<User, 'id'> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: 'guest', // Always guest role for new users
      password: CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString(),
    };
    
    onAddUser(newUser);
    
    toast({
      title: 'User Added',
      description: `The profile for ${newUser.name} has been created.`,
    });
    
    setOpen(false);
    formRef.current?.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user profile.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} id="add-user-form">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Username
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., guestuser"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                className="col-span-3"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="col-span-3"
                required
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="add-user-form">Save User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}