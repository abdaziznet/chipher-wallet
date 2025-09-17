
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from '@/contexts/session-context';

export default function SettingsPage() {
  const { currentUser } = useSession();

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
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your profile information is managed through your Google account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{currentUser.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>
            </CardContent>
             <CardFooter>
                <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Manage Google Account</Button>
                </a>
            </CardFooter>
          </Card>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Your password is managed through your Google account.
            </CardDescription>
          </CardHeader>
           <CardContent>
                <p className="text-sm text-muted-foreground">
                    To change your password, please visit your Google account security settings.
                </p>
            </CardContent>
             <CardFooter>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">Google Security Settings</Button>
                </a>
            </CardFooter>
        </Card>
      </div>
    </div>
  )
}
