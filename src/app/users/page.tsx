
'use client';

import * as React from 'react';
import * as yaml from 'js-yaml';
import * as CryptoJS from 'crypto-js';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  FileDown,
  FileUp,
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
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/lib/types';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';
import { AddUserDialog } from '@/components/add-user-dialog';
import { EditUserDialog } from '@/components/edit-user-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExportUsersDialog } from '@/components/export-users-dialog';


export default function UsersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { users, currentUser, setUsers } = useSession();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push('/');
    }
  }, [currentUser, router, toast]);

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const updatedUsers = [
      ...users,
      { ...newUser, id: `user_${Date.now()}` },
    ];
    setUsers(updatedUsers);
  };
  
  const handleEditUser = (updatedUser: User) => {
    const updatedUsers = users.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    setUserToEdit(null);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
        toast({ variant: 'destructive', title: 'Error', description: 'You cannot delete your own account.'});
        return;
    }
    // Prevent deleting the static admin
    if (id === 'static_admin') {
      toast({ variant: 'destructive', title: 'Error', description: 'The static admin user cannot be deleted.'});
      return;
    }
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    toast({
      title: 'User Deleted',
      description: 'The user has been successfully removed.',
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.has(currentUser?.id || '')) {
        toast({ variant: 'destructive', title: 'Error', description: 'You cannot delete your own account.'});
        return;
    }
     if (selectedIds.has('static_admin')) {
        toast({ variant: 'destructive', title: 'Error', description: 'The static admin user cannot be deleted.'});
        return;
    }
    const updatedUsers = users.filter((u) => !selectedIds.has(u.id));
    setUsers(updatedUsers);
    toast({
      title: `${selectedIds.size} Users Deleted`,
      description: 'The selected users have been removed.',
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
        let importedUsers: Partial<User>[] = [];

        if (fileExtension === 'json') {
          importedUsers = JSON.parse(text);
        } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
          importedUsers = yaml.load(text) as Partial<User>[];
        } else if (fileExtension === 'csv') {
           const lines = text.split('\n').filter(line => line.trim() !== '');
          const headerLine = lines.shift();
          if (!headerLine) throw new Error('CSV file is empty or has no header.');
          
          const header = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
          
          importedUsers = lines.map((line) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const entryData: {[key: string]: string | undefined} = {};
            header.forEach((h, i) => {
               if (h === 'id' || h === 'name' || h === 'email' || h === 'role') {
                entryData[h] = values[i] || '';
               }
            });
            return entryData as Partial<User>;
          });
        } else {
          throw new Error('Unsupported file format. Please use CSV, JSON, or YAML.');
        }

        const newUsers: User[] = [];
        const updatedUsersList = [...users];

        importedUsers.forEach((entry, index) => {
          if (!entry.id || !entry.name || !entry.email || !entry.role) {
            console.warn(`Skipping invalid user entry at index ${index}`);
            return;
          }

          if (entry.role !== 'admin' && entry.role !== 'guest') {
             console.warn(`Skipping user with invalid role at index ${index}`);
            return;
          }

          const fullEntry: User = {
            id: entry.id,
            name: entry.name,
            email: entry.email,
            role: entry.role,
            // Passwords are not imported for security. They must be set manually.
          };

          const existingIndex = updatedUsersList.findIndex(p => p.id === fullEntry.id);
          if (existingIndex > -1) {
             if(updatedUsersList[existingIndex].id !== 'static_admin') {
                updatedUsersList[existingIndex] = {...updatedUsersList[existingIndex], ...fullEntry};
             }
          } else {
            newUsers.push(fullEntry);
          }
        });
        
        setUsers([...updatedUsersList, ...newUsers]);

        toast({
          title: 'Import Successful',
          description: `${importedUsers.length} users have been processed.`,
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


  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = filteredUsers.map((u) => u.id).filter(id => id !== 'static_admin');
      setSelectedIds(new Set(ids));
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
    filteredUsers.filter(u => u.id !== 'static_admin').length > 0 && 
    selectedIds.size === filteredUsers.filter(u => u.id !== 'static_admin').length;

  if (currentUser?.role !== 'admin') {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <ExportUsersDialog users={users}>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Export
            </Button>
          </ExportUsersDialog>
          <AddUserDialog onAddUser={handleAddUser}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </AddUserDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>
            Add, edit, or remove user profiles.
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
                    disabled={filteredUsers.filter(u => u.id !== 'static_admin').length === 0}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={(checked) => handleSelectOne(user.id, checked as boolean)}
                        aria-label={`Select ${user.name}`}
                        disabled={user.id === 'static_admin'}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              disabled={user.id === 'static_admin'}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    No users found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {userToEdit && (
        <EditUserDialog
          user={userToEdit}
          onEditUser={handleEditUser}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
        />
      )}
    </>
  );
}
