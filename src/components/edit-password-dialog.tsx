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
import type { PasswordEntry } from '@/lib/types';

interface EditPasswordDialogProps {
  password: PasswordEntry;
  onEditPassword: (updatedPassword: PasswordEntry) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditPasswordDialog({
  password,
  onEditPassword,
  onOpenChange,
}: EditPasswordDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedPassword = {
      ...password,
      appName: formData.get('appName') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      website: formData.get('website') as string,
    };
    onEditPassword(updatedPassword);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Password</DialogTitle>
          <DialogDescription>
            Update the details for this account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} id="edit-password-form">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appName" className="text-right">
                App Name
              </Label>
              <Input
                id="appName"
                name="appName"
                defaultValue={password.appName}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                defaultValue={password.username}
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
                defaultValue={password.password}
                type="password"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                defaultValue={password.website}
                placeholder="https://example.com"
                className="col-span-3"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="edit-password-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
