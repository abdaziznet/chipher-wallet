
'use client';

import * as React from 'react';
import * as yaml from 'js-yaml';
import * as CryptoJS from 'crypto-js';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  KeyRound,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Folder,
  ArrowUpDown,
  Edit,
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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddPasswordDialog } from '@/components/add-password-dialog';
import { DecryptAndCopyDialog } from '@/components/decrypt-and-copy-dialog';
import type { PasswordEntry, PasswordCategory } from '@/lib/types';
import { passwordCategories } from '@/lib/types';
import { AppIcon } from '@/components/app-icon';
import { useToast } from '@/hooks/use-toast';
import { EditPasswordDialog } from '@/components/edit-password-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';
import { getPasswords, deletePassword, deletePasswords, addPassword, updatePassword } from '@/ai/flows/passwords-flow';
import {
  addPasswordAction,
  deletePasswordAction,
  deletePasswordsAction,
  updatePasswordAction,
} from './passwords/actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 5;

export default function PasswordsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [passwords, setPasswords] = React.useState<PasswordEntry[]>([]);
  const { toast } = useToast();
  const [passwordToEdit, setPasswordToEdit] = React.useState<PasswordEntry | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const { currentUser } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [categoryFilter, setCategoryFilter] = React.useState<Set<PasswordCategory>>(new Set());
  const [deleteTarget, setDeleteTarget] = React.useState<string | string[] | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof PasswordEntry; direction: 'ascending' | 'descending' }>({ key: 'id', direction: 'descending' });

  const fetchPasswords = React.useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const userPasswords = await getPasswords(currentUser.id);
      setPasswords(userPasswords);
    } catch (error: any) {
      console.error('Failed to load passwords', error);
      toast({
        variant: 'destructive',
        title: 'Error Loading Passwords',
        description: error.message || 'Could not load saved passwords from the cloud.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  React.useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else {
      fetchPasswords();
    }
  }, [currentUser, router, fetchPasswords]);

  const handleAddPassword = async (data: Omit<PasswordEntry, 'id' | 'userId'> & { secretKey: string }) => {
    if (!currentUser) return;
    const result = await addPasswordAction({ ...data, userId: currentUser.id });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      await fetchPasswords();
      toast({ variant: 'success', title: 'Success', description: 'Password added successfully.' });
    }
  };

  const handleEditPassword = async (updatedPassword: PasswordEntry, secretKey: string) => {
    if (!currentUser) return;
    const result = await updatePasswordAction({ ...updatedPassword, userId: currentUser.id }, secretKey);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      await fetchPasswords();
      setPasswordToEdit(null);
      toast({ variant: 'success', title: 'Success', description: 'Password updated successfully.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (Array.isArray(deleteTarget)) {
      // Multiple items deletion
      const ids = deleteTarget;
      const result = await deletePasswordsAction(ids);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        await fetchPasswords();
        toast({
          variant: 'success',
          title: `${ids.length} Passwords Deleted`,
          description: 'The selected passwords have been removed.',
        });
        setSelectedIds(new Set());
      }
    } else {
      // Single item deletion
      const id = deleteTarget;
      const result = await deletePasswordAction(id);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        await fetchPasswords();
        toast({
          variant: 'success',
          title: 'Password Deleted',
          description: 'The password has been successfully removed.',
        });
      }
    }
    setDeleteTarget(null);
  };


  const handleDeletePassword = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0) {
      setDeleteTarget(ids);
    }
  };

  const handleCategoryFilterChange = (category: PasswordCategory) => {
    const newFilter = new Set(categoryFilter);
    if (newFilter.has(category)) {
      newFilter.delete(category);
    } else {
      newFilter.add(category);
    }
    setCategoryFilter(newFilter);
    setCurrentPage(1);
  };

  const requestSort = (key: keyof PasswordEntry) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedPasswords = React.useMemo(() => {
    let sortableItems = [...passwords];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [passwords, sortConfig]);

  const filteredPasswords = sortedPasswords.filter(p => {
    const searchTermMatch =
      p.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch =
      categoryFilter.size === 0 || categoryFilter.has(p.category);
    return searchTermMatch && categoryMatch;
  });
  
  const totalPages = Math.ceil(filteredPasswords.length / PAGE_SIZE);

  const paginatedPasswords = filteredPasswords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    // If the current page becomes empty and it's not the first page, go to the previous page.
    if (paginatedPasswords.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [paginatedPasswords.length, currentPage, totalPages]);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    paginatedPasswords.forEach(p => {
      if (checked) {
        newSelectedIds.add(p.id);
      } else {
        newSelectedIds.delete(p.id);
      }
    });
    setSelectedIds(newSelectedIds);
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

  const areAllOnPageSelected =
    paginatedPasswords.length > 0 && paginatedPasswords.every(p => selectedIds.has(p.id));
  
  const getCategoryBadgeColor = (category: PasswordCategory) => {
    switch (category) {
      case 'banking':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'email':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'social media':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'game':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'productivity':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };


  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
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
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Folder className="mr-2 h-4 w-4" />
                Category
                {categoryFilter.size > 0 && <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">{categoryFilter.size}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {passwordCategories.map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={categoryFilter.has(cat)}
                  onCheckedChange={() => handleCategoryFilterChange(cat)}
                  className="capitalize"
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddPasswordDialog onAddPassword={handleAddPassword}>
            <Button className="flex-1 md:flex-none">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </AddPasswordDialog>
        </div>
        {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected} className="w-full md:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedIds.size})
            </Button>
        )}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Passwords</CardTitle>
            <CardDescription>
              A secure list of all your saved credentials.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchPasswords} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[40px]">
                  <Checkbox
                    checked={areAllOnPageSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    disabled={paginatedPasswords.length === 0}
                  />
                </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Icon</span>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('appName')}>
                    Account
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Username</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading passwords...</span>
                      </div>
                    </TableCell>
                  </TableRow>
              ) : paginatedPasswords.length > 0 ? (
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
                        <AppIcon appName={password.appName} className="h-5 w-5" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{password.appName}</span>
                        <span className="text-muted-foreground md:hidden">{password.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{password.username}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={cn("capitalize border-transparent", getCategoryBadgeColor(password.category))}>{password.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <DecryptAndCopyDialog encryptedPassword={password.password}>
                           <Button variant="ghost" size="icon" aria-label="Copy password">
                              <KeyRound className="h-4 w-4" />
                           </Button>
                        </DecryptAndCopyDialog>
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
                            <DropdownMenuItem
                              onClick={() => setPasswordToEdit(password)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                    colSpan={6}
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
          <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{paginatedPasswords.length}</strong> of <strong>{filteredPasswords.length}</strong> passwords.
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
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
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
      <AlertDialog open={!!deleteTarget} onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
