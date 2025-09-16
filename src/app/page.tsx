
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
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { AppIcon } from '@/components/app-icon';
import { useToast } from '@/hooks/use-toast';
import { ExportDialog } from '@/components/export-dialog';
import { EditPasswordDialog } from '@/components/edit-password-dialog';
import { Checkbox } from '@/components/ui/checkbox';

const LOCAL_STORAGE_KEY = 'cipherwallet-passwords';
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

export default function PasswordsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [passwords, setPasswords] = React.useState<PasswordEntry[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [passwordToEdit, setPasswordToEdit] = React.useState<PasswordEntry | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    try {
      const savedPasswords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedPasswords) {
        setPasswords(JSON.parse(savedPasswords));
      }
    } catch (error) {
      console.error('Failed to load passwords from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load saved passwords.',
      });
    }
  }, [toast]);

  const updatePasswords = (newPasswords: PasswordEntry[]) => {
    setPasswords(newPasswords);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPasswords));
    } catch (error) {
      console.error('Failed to save passwords to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save passwords.',
      });
    }
  };

  const handleAddPassword = (newPassword: Omit<PasswordEntry, 'id'>) => {
    const updatedPasswords = [
      ...passwords,
      { ...newPassword, id: `pw_${Date.now()}` },
    ];
    updatePasswords(updatedPasswords);
  };

  const handleEditPassword = (updatedPassword: PasswordEntry) => {
    const updatedPasswords = passwords.map((p) =>
      p.id === updatedPassword.id ? updatedPassword : p
    );
    updatePasswords(updatedPasswords);
    setPasswordToEdit(null);
  };

  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((p) => p.id !== id);
    updatePasswords(updatedPasswords);
    toast({
      title: 'Password Deleted',
      description: 'The password has been successfully removed.',
    });
  };

  const handleDeleteSelected = () => {
    const updatedPasswords = passwords.filter((p) => !selectedIds.has(p.id));
    updatePasswords(updatedPasswords);
    toast({
      title: `${selectedIds.size} Passwords Deleted`,
      description: 'The selected passwords have been removed.',
    });
    setSelectedIds(new Set());
  }

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
        let importedPasswords: Partial<PasswordEntry>[] = [];

        if (fileExtension === 'json') {
          importedPasswords = JSON.parse(text);
        } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
          importedPasswords = yaml.load(text) as Partial<PasswordEntry>[];
        } else if (fileExtension === 'csv') {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const headerLine = lines.shift();
          if (!headerLine) throw new Error('CSV file is empty or has no header.');
          
          const header = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
          
          importedPasswords = lines.map((line) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const entryData: {[key: string]: string} = {};
            header.forEach((h, i) => {
              entryData[h] = values[i] || '';
            });

            return entryData as Partial<PasswordEntry>;
          });
        } else {
          throw new Error('Unsupported file format. Please use CSV, JSON, or YAML.');
        }

        const firstPassword = importedPasswords.find(p => p.password)?.password;
        const isLikelyEncrypted = firstPassword && (firstPassword.startsWith('U2FsdGVk') || firstPassword.length > 50);

        let decryptionKey = '';
        if (isLikelyEncrypted) {
          decryptionKey = prompt('It looks like this file is encrypted. Please enter your encryption key to decrypt the passwords.') || '';
        }
        
        const newPasswords: PasswordEntry[] = [];
        const updatedPasswordsList = [...passwords];

        importedPasswords.forEach((entry, index) => {
          if (!entry.appName || !entry.username || !entry.password) {
            console.warn(`Skipping invalid entry at index ${index}`);
            return;
          }

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
          
          const fullEntry: PasswordEntry = {
            id: entry.id || `pw_import_${Date.now()}_${index}`,
            appName: entry.appName,
            username: entry.username,
            password: decryptedPassword,
            website: entry.website || '',
          };

          const existingIndex = updatedPasswordsList.findIndex(p => p.id === fullEntry.id);
          if (existingIndex > -1) {
            updatedPasswordsList[existingIndex] = fullEntry;
          } else {
            newPasswords.push(fullEntry);
          }
        });
        
        updatePasswords([...updatedPasswordsList, ...newPasswords]);

        toast({
          title: 'Import Successful',
          description: `${importedPasswords.length} passwords have been processed.`,
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
  
  const totalPages = Math.ceil(filteredPasswords.length / PAGE_SIZE);

  const paginatedPasswords = filteredPasswords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredPasswords.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const areAllFilteredSelected =
    filteredPasswords.length > 0 && selectedIds.size === filteredPasswords.length && filteredPasswords.every(p => selectedIds.has(p.id));


  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {selectedIds.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
          )}
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
                 <TableHead className="w-[40px]">
                  <Checkbox
                    checked={areAllFilteredSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    disabled={filteredPasswords.length === 0}
                  />
                </TableHead>
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
              {paginatedPasswords.length > 0 ? (
                paginatedPasswords.map((password) => (
                  <TableRow key={password.id} data-state={selectedIds.has(password.id) && "selected"}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(password.id)}
                        onCheckedChange={(checked) => handleSelectOne(password.id, checked as boolean)}
                        aria-label={`Select ${password.appName}`}
                      />
                    </TableCell>
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
                            <DropdownMenuItem onClick={() => setPasswordToEdit(password)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeletePassword(password.id)}
                            >
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
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No passwords found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      {passwordToEdit && (
        <EditPasswordDialog
          password={passwordToEdit}
          onEditPassword={handleEditPassword}
          onOpenChange={(isOpen) => !isOpen && setPasswordToEdit(null)}
        />
      )}
    </>
  );
}
