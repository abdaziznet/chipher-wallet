
'use client';

import * as React from 'react';
import * as yaml from 'js-yaml';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { User } from '@/lib/types';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY || 'default-secret-key';

interface ExportUsersDialogProps {
  children: React.ReactNode;
  users: User[];
}

export function ExportUsersDialog({ children, users }: ExportUsersDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState('csv');

  const handleExport = () => {
    let data;
    let contentType;
    let fileExtension;

    const usersToExport = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password ? CryptoJS.AES.encrypt(u.password, ENCRYPTION_KEY).toString() : '',
    }));

    switch (format) {
      case 'json':
        data = JSON.stringify(usersToExport, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      case 'yaml':
        data = yaml.dump(usersToExport);
        contentType = 'application/x-yaml';
        fileExtension = 'yaml';
        break;
      case 'csv':
      default:
        const header = ['id', 'name', 'email', 'role', 'password'];
        const csvContent = [
          header.join(','),
          ...usersToExport.map(u =>
            [
              `"${u.id}"`,
              `"${u.name.replace(/"/g, '""')}"`,
              `"${(u.email || '').replace(/"/g, '""')}"`,
              `"${u.role}"`,
              `"${u.password}"`
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
    link.download = `cipherwallet-users-${timestamp}.${fileExtension}`;
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
          <DialogTitle>Export Users</DialogTitle>
          <DialogDescription>
            Choose your export format. Passwords will be included and encrypted.
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
        </div>
        <DialogFooter>
          <Button onClick={handleExport}>Export Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
