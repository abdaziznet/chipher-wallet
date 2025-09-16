
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

interface EditUserDialogProps {
  user: User;
  onEditUser: (updatedUser: User) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, onEditUser, onOpenChange }: EditUserDialogProps) {
  const [open, setOpen] = React.useState(true);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

   React.useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    const updatedUser = {
      ...user,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      // Role is not editable, it's determined by login
      role: user.role,
      password: password 
        ? CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString() 
        : user.password,
    };
    onEditUser(updatedUser);
    
    toast({
      title: 'User Updated',
      description: `The profile for ${updatedUser.name} has been updated.`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user's profile details.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} id="edit-user-form">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Username
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
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
                defaultValue={user.email}
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
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="edit-user-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
