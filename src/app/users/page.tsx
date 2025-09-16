
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Edit,
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
import { useUsers } from '@/hooks/use-users';
import { useRouter } from 'next/navigation';
import { AddUserDialog } from '@/components/add-user-dialog';
import { EditUserDialog } from '@/components/edit-user-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function UsersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { users, currentUser, setUsers, setCurrentUserId } = useUsers();
  const { toast } = useToast();
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser?.role !== 'superadmin') {
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
    const updatedUsers = users.filter((u) => !selectedIds.has(u.id));
    setUsers(updatedUsers);
    toast({
      title: `${selectedIds.size} Users Deleted`,
      description: 'The selected users have been removed.',
    });
    setSelectedIds(new Set());
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
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
    filteredUsers.length > 0 && selectedIds.size === filteredUsers.length;

  if (currentUser?.role !== 'superadmin') {
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
                        <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
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
