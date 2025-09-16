'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import * as yaml from 'js-yaml';
import {
  MoreHorizontal,
  PlusCircle,
  FileUp,
  Search,
  KeyRound,
  FileDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddPasswordDialog } from '@/components/add-password-dialog';
import { CopyButton } from '@/components/copy-button';
import type { PasswordEntry } from '@/lib/types';
import { mockPasswords } from '@/lib/data';
import { AppIcon } from '@/components/app-icon';
import { useToast } from '@/hooks/use-toast';
import { ExportDialog } from '@/components/export-dialog';

export default function PasswordsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [passwords, setPasswords] = React.useState<PasswordEntry[]>(mockPasswords);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddPassword = (newPassword: Omit<PasswordEntry, 'id'>) => {
    setPasswords((prev) => [
      { id: `pw_${Date.now()}`, ...newPassword },
      ...prev,
    ]);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      try {
        let importedPasswords: Omit<PasswordEntry, 'id'>[] = [];

        if (fileExtension === 'json') {
          importedPasswords = JSON.parse(text);
        } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
          importedPasswords = yaml.load(text) as Omit<PasswordEntry, 'id'>[];
        } else if (fileExtension === 'csv') {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const headerLine = lines.shift();
          if (!headerLine) throw new Error('CSV file is empty or has no header.');
          
          const header = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
          const requiredHeaders = ['appName', 'username', 'password'];
          if (!requiredHeaders.every(h => header.includes(h))) {
            throw new Error('Invalid CSV header. Must include appName, username, and password.');
          }

          importedPasswords = lines.map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const entryData: {[key: string]: string} = {};
            header.forEach((h, i) => {
              entryData[h] = values[i] || '';
            });

            const entry: Omit<PasswordEntry, 'id'> = {
              appName: entryData.appName || '',
              username: entryData.username || '',
              password: entryData.password || '',
              website: entryData.website || '',
            };
            if (!entry.appName || !entry.username || !entry.password) {
              throw new Error(`Invalid data on line ${index + 2}. appName, username, and password are required.`);
            }
            return entry;
          });
        } else {
          throw new Error('Unsupported file format. Please use CSV, JSON, or YAML.');
        }

        // Check if passwords might be encrypted and ask for a key if so
        const firstPassword = importedPasswords[0]?.password;
        const isLikelyEncrypted = firstPassword && (firstPassword.startsWith('U2FsdGVk') || firstPassword.length > 50);

        let decryptionKey = '';
        if (isLikelyEncrypted) {
          decryptionKey = prompt('It looks like this file is encrypted. Please enter your encryption key to decrypt the passwords.') || '';
        }
        
        const newPasswords: PasswordEntry[] = importedPasswords.map((entry, index) => {
          let decryptedPassword = entry.password;
          if (decryptionKey) {
            try {
              const bytes = CryptoJS.AES.decrypt(entry.password, decryptionKey);
              decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
              if (!decryptedPassword) {
                 throw new Error(`Decryption failed for an entry. Please check your key.`);
              }
            } catch (err) {
              throw new Error(`Decryption failed for entry "${entry.appName}". Please check your key.`);
            }
          }

          return {
            id: `pw_import_${Date.now()}_${index}`,
            ...entry,
            password: decryptedPassword,
          };
        });

        setPasswords(prev => [...prev, ...newPasswords]);
        toast({
          title: 'Import Successful',
          description: `${newPasswords.length} passwords have been imported.`,
        });
      } catch (error) {
        console.error('Failed to import file:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Could not parse the file. Please check the format and content.',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredPasswords = passwords.filter(
    (p) =>
      p.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
            accept=".csv,.json,.yaml,.yml"
          />
          <Button variant="outline" onClick={handleImportClick}>
            <FileDown className="mr-2 h-4 w-4" />
            Import
          </Button>
          <ExportDialog passwords={passwords}>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Export
            </Button>
          </ExportDialog>
          <AddPasswordDialog onAddPassword={handleAddPassword}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Password
            </Button>
          </AddPasswordDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Passwords</CardTitle>
          <CardDescription>
            A secure list of all your saved credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Icon</span>
                </TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPasswords.length > 0 ? (
                filteredPasswords.map((password) => (
                  <TableRow key={password.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <AppIcon appName={password.appName} className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {password.appName}
                    </TableCell>
                    <TableCell>{password.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <CopyButton
                          valueToCopy={password.password}
                          tooltip="Copy password"
                        >
                          <KeyRound className="h-4 w-4" />
                          <span className="sr-only">Copy Password</span>
                        </CopyButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No passwords found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
