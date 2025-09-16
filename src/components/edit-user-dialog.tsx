
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { User } from '@/lib/types';

interface EditUserDialogProps {
  user: User;
  onEditUser: (updatedUser: User) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, onEditUser, onOpenChange }: EditUserDialogProps) {
  const [open, setOpen] = React.useState(true);
  const formRef = React.useRef<HTMLFormElement>(null);

   React.useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedUser = {
      ...user,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: (formData.get('role') as 'guest' | 'admin') || 'guest',
    };
    onEditUser(updatedUser);
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
                Full Name
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
              <Label className="text-right">Role</Label>
              <RadioGroup name="role" defaultValue={user.role} className="col-span-3 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="role-guest" />
                  <Label htmlFor="role-guest">Guest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="role-admin" />
                  <Label htmlFor="role-admin">Admin</Label>
                </div>
              </RadioGroup>
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
