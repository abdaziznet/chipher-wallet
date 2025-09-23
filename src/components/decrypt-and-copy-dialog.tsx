
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
import { CopyButton } from './copy-button';

interface DecryptAndCopyDialogProps {
  children: React.ReactNode;
  encryptedPassword?: string;
}

export function DecryptAndCopyDialog({ children, encryptedPassword }: DecryptAndCopyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [secretKey, setSecretKey] = React.useState('');
  const [decryptedPassword, setDecryptedPassword] = React.useState('');
  const { toast } = useToast();

  const handleDecrypt = () => {
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

      setDecryptedPassword(decrypted);
      toast({ title: 'Success', description: 'Password decrypted.' });

    } catch (e) {
      setDecryptedPassword('');
      toast({ variant: 'destructive', title: 'Decryption Failed', description: 'Could not decrypt the password. Please check your secret key.' });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setSecretKey('');
      setDecryptedPassword('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Decrypt and Copy Password</DialogTitle>
          <DialogDescription>
            Enter the secret key to decrypt the password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secretKey" className="text-right">
              Secret Key
            </Label>
            <Input
              id="secretKey"
              name="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          {decryptedPassword && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="decryptedPassword" className="text-right">
                    Decrypted
                </Label>
                <div className="col-span-3 relative">
                     <Input
                        id="decryptedPassword"
                        name="decryptedPassword"
                        type="text"
                        value={decryptedPassword}
                        readOnly
                        className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <CopyButton valueToCopy={decryptedPassword} />
                    </div>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleDecrypt}>Decrypt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
