
'use client';

import * as React from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { User } from '@/lib/types';

interface AddUserDialogProps {
  children: React.ReactNode;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
}

export function AddUserDialog({ children, onAddUser }: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUser = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: (formData.get('role') as 'user' | 'superadmin') || 'user',
    };
    onAddUser(newUser);
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
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
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
              <Label className="text-right">Role</Label>
              <RadioGroup name="role" defaultValue="user" className="col-span-3 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="role-user" />
                  <Label htmlFor="role-user">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="superadmin" id="role-superadmin" />
                  <Label htmlFor="role-superadmin">Super Admin</Label>
                </div>
              </RadioGroup>
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
