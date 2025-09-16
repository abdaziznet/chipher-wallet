'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import * as yaml from 'js-yaml';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { PasswordEntry } from '@/lib/types';
import { Input } from './ui/input';

interface ExportDialogProps {
  children: React.ReactNode;
  passwords: PasswordEntry[];
}

export function ExportDialog({ children, passwords }: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState('csv');
  const [encrypt, setEncrypt] = React.useState(false);
  const [encryptionKey, setEncryptionKey] = React.useState('');
  const [keyError, setKeyError] = React.useState('');

  const handleExport = () => {
    if (encrypt) {
      if (!encryptionKey) {
        setKeyError('Encryption key is required.');
        return;
      }
      if (encryptionKey !== process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY) {
        setKeyError('Invalid encryption key. Export failed.');
        return;
      }
    }
    setKeyError('');

    let data;
    let contentType;
    let fileExtension;

    const passwordsToExport = passwords.map(p => {
      const entry: Omit<PasswordEntry, 'userId'> & { id: string } = {
        id: p.id,
        appName: p.appName,
        username: p.username,
        password: p.password,
        website: p.website,
      };
      
      if (encrypt) {
        entry.password = CryptoJS.AES.encrypt(p.password, encryptionKey).toString();
      }
      return entry;
    });

    switch (format) {
      case 'json':
        data = JSON.stringify(passwordsToExport, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      case 'yaml':
        data = yaml.dump(passwordsToExport);
        contentType = 'application/x-yaml';
        fileExtension = 'yaml';
        break;
      case 'csv':
      default:
        const header = ['id', 'appName', 'username', 'password', 'website'];
        const csvContent = [
          header.join(','),
          ...passwordsToExport.map(p =>
            [
              `"${p.id}"`,
              `"${p.appName.replace(/"/g, '""')}"`,
              `"${p.username.replace(/"/g, '""')}"`,
              `"${p.password.replace(/"/g, '""')}"`,
              `"${(p.website || '').replace(/"/g, '""')}"`
            ].join(',')
          )
        ].join('\n');
        data = csvContent;
        contentType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
        break;
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}-${hour}${minute}${second}`;

    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cipherwallet-passwords-${timestamp}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Passwords</DialogTitle>
          <DialogDescription>
            Choose your export format and encryption options.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label>File Format</Label>
            <RadioGroup
              defaultValue="csv"
              value={format}
              onValueChange={setFormat}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yaml" id="yaml" />
                <Label htmlFor="yaml">YAML</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="encrypt"
                checked={encrypt}
                onCheckedChange={(checked) => setEncrypt(checked as boolean)}
              />
              <Label htmlFor="encrypt">Encrypt password column</Label>
            </div>
            {encrypt && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="encryptionKey">Encryption Key</Label>
                <Input
                  id="encryptionKey"
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Enter a strong key"
                />
                 {keyError && <p className="text-sm text-destructive">{keyError}</p>}
                <p className="text-xs text-muted-foreground">
                  Remember this key. You'll need it to decrypt your passwords.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExport}>Export Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
