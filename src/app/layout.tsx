
'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, Bot, Settings, ShieldCheck, Users, Wrench } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { SessionProvider, useSession } from '@/contexts/session-context';
import React from 'react';

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoaded } = useSession();

  const allNavItems = [
    { href: '/', label: 'All Passwords', icon: Home, roles: ['admin', 'guest'] },
    { href: '/generator', label: 'Password Generator', icon: Bot, roles: ['admin', 'guest'] },
    { href: '/tools', label: 'Tools', icon: Wrench, roles: ['admin'] },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'guest'] },
  ];
  
  React.useEffect(() => {
    if (isLoaded) {
      if (currentUser && pathname === '/login') {
        router.push('/');
      } else if (!currentUser && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [isLoaded, currentUser, pathname, router]);

  const renderLoading = () => (
     <html lang="en" suppressHydrationWarning>
      <head>
        <title>CipherWallet</title>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <div className="flex h-screen items-center justify-center">
          {/* You can add a loading spinner here */}
        </div>
      </body>
    </html>
  );

  if (!isLoaded || (!currentUser && pathname !== '/login')) {
    return renderLoading();
  }
  
  if (pathname === '/login') {
    return (
       <html lang="en" suppressHydrationWarning>
        <head>
          <title>Login - CipherWallet</title>
        </head>
        <body className="font-body antialiased bg-background" suppressHydrationWarning>
          <main className="flex h-screen items-center justify-center">{children}</main>
        </body>
      </html>
    )
  }

  const navItems = allNavItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>CipherWallet</title>
        <meta name="description" content="A modern and secure password manager." />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Toaster />
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 font-headline">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">CipherWallet</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-4 ml-auto">
                 <UserNav />
              </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  )
}
