
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
import type { PasswordEntry, PasswordCategory } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { passwordCategories } from '@/lib/types';

interface EditPasswordDialogProps {
  password: PasswordEntry;
  onEditPassword: (updatedPassword: PasswordEntry) => void;
  onOpenChange: (open: boolean) => void;
}

const DECRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

export function EditPasswordDialog({
  password,
  onEditPassword,
  onOpenChange,
}: EditPasswordDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(true);
  const [category, setCategory] = React.useState<PasswordCategory>(password.category || 'other');
  
  const decryptedPassword = React.useMemo(() => {
    try {
      const bytes = CryptoJS.AES.decrypt(password.password, DECRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || password.password;
    } catch {
      return password.password;
    }
  }, [password.password]);

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
      category,
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
                defaultValue={decryptedPassword}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={(value: PasswordCategory) => setCategory(value)} defaultValue={category}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {passwordCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
