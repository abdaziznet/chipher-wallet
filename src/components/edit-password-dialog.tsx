
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
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface EditPasswordDialogProps {
  password: PasswordEntry;
  onEditPassword: (updatedPassword: PasswordEntry, secretKey: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditPasswordDialog({
  password,
  onEditPassword,
  onOpenChange,
}: EditPasswordDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [open, setOpen] = React.useState(true);
  const [category, setCategory] = React.useState<PasswordCategory>(password.category || 'other');
  const [secretKey, setSecretKey] = React.useState('');
  const [decryptedPassword, setDecryptedPassword] = React.useState('');
  const [isDecrypted, setIsDecrypted] = React.useState(false);
  const { toast } = useToast();
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  React.useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  const handleDecryptForEditing = () => {
    if (!secretKey) {
        toast({ variant: 'warning', title: 'Error', description: 'Secret key is required to decrypt for editing.' });
        return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(password.password, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error("Decryption failed");
      setDecryptedPassword(decrypted);
      setIsDecrypted(true);
      toast({ variant: 'success', title: 'Success', description: 'Password decrypted. You can now edit it.' });
    } catch {
      toast({ variant: 'destructive', title: 'Decryption Failed', description: 'Could not decrypt password. Check the secret key.' });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDecrypted) {
        toast({ variant: 'warning', title: 'Not Decrypted', description: 'Please decrypt the password before saving changes.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const updatedPassword = {
      ...password,
      appName: formData.get('appName') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      website: formData.get('website') as string,
      category,
    };
    onEditPassword(updatedPassword, secretKey); // Pass the same key for re-encryption
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onOpenChange(false);
      setShowSecretKey(false);
      setShowPassword(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Password</DialogTitle>
          <DialogDescription>
            Enter the secret key to decrypt and edit. The same key will be used to re-encrypt.
          </DialogDescription>
        </DialogHeader>
        
        {!isDecrypted ? (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="secretKey" className="text-right">Secret Key</Label>
                    <div className="col-span-3 relative">
                      <Input
                          id="secretKey"
                          type={showSecretKey ? 'text' : 'password'}
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          className="pr-10"
                      />
                       <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSecretKey(prev => !prev)}
                        >
                          {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showSecretKey ? 'Hide secret key' : 'Show secret key'}</span>
                       </Button>
                    </div>
                </div>
                 <Button onClick={handleDecryptForEditing}>Edit</Button>
            </div>
        ) : (
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
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    name="password"
                    defaultValue={decryptedPassword}
                    type={showPassword ? 'text' : 'password'}
                    className="pr-10"
                    required
                  />
                   <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                   </Button>
                </div>
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
            <DialogFooter>
                <Button type="submit" form="edit-password-form">
                    Save changes
                </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
