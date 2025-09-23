
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
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface DecryptAndCopyDialogProps {
  children: React.ReactNode;
  encryptedPassword?: string;
}

export function DecryptAndCopyDialog({ children, encryptedPassword }: DecryptAndCopyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [secretKey, setSecretKey] = React.useState('');
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!encryptedPassword || !secretKey) {
      toast({ variant: 'destructive', title: 'Error', description: 'Secret key is required.' });
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Decryption failed. Check your secret key.');
      }

      await navigator.clipboard.writeText(decrypted);
      toast({ title: 'Success', description: 'Password copied to clipboard.' });
      setOpen(false); // Close dialog on success

    } catch (e) {
      toast({ variant: 'destructive', title: 'Decryption Failed', description: 'Could not decrypt the password. Please check your secret key.' });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setSecretKey('');
      setShowSecretKey(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Copy Password</DialogTitle>
          <DialogDescription>
            Enter the secret key to decrypt and copy the password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secretKey" className="text-right">
              Secret Key
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="secretKey"
                name="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="pr-10"
                required
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
        </div>
        <DialogFooter>
          <Button onClick={handleCopy}>Copy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}