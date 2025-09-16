
'use client';
import * as React from 'react';
import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from '@/contexts/session-context';
import { useToast } from '@/hooks/use-toast';
import { updatePasswordAction } from './actions';
import { Eye, EyeOff } from 'lucide-react';

const initialState = {
  error: '',
  success: '',
};

export default function SettingsPage() {
  const { currentUser } = useSession();
  const [state, formAction] = useActionState(updatePasswordAction, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);


  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.success) {
      toast({
        title: 'Success',
        description: state.success,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
       <div className="grid gap-2">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and application preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {currentUser.role === 'admin' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Current User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Profile</Button>
              </CardFooter>
            </Card>
            <Separator />
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              {currentUser.role === 'admin' 
                ? "The static admin password cannot be changed from this interface."
                : "Change your password."
              }
            </CardDescription>
          </CardHeader>
          {currentUser.role === 'guest' && (
            <form ref={formRef} action={formAction}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input id="current-password" name="currentPassword" type={showCurrentPassword ? 'text' : 'password'} required />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(prev => !prev)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showCurrentPassword ? 'Hide password' : 'Show password'}</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input id="new-password" name="newPassword" type={showNewPassword ? 'text' : 'password'} required />
                     <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(prev => !prev)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showNewPassword ? 'Hide password' : 'Show password'}</span>
                    </Button>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required />
                     <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          )}
           {currentUser.role === 'admin' && (
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    To change the admin password, you must modify the application source code.
                </p>
            </CardContent>
           )}
        </Card>
      </div>
    </div>
  )
}
