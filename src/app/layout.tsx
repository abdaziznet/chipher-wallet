
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
import { Home, Wrench, ShieldCheck, ShieldEllipsis } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { SessionProvider, useSession } from '@/contexts/session-context';
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';


function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoaded } = useSession();

  const allNavItems = [
    { href: '/', label: 'All Passwords', icon: Home, roles: ['admin', 'guest'] },
    { href: '/generator', label: 'Password Generator', icon: ShieldEllipsis, roles: ['admin', 'guest'] },
    { href: '/tools', label: 'Tools', icon: Wrench, roles: ['admin'] },
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
    <div className="flex h-screen items-center justify-center">
      {/* You can add a loading spinner here */}
    </div>
  );

  if (!isLoaded || (!currentUser && pathname !== '/login')) {
    return renderLoading();
  }
  
  if (pathname === '/login') {
    return (
      <main className="flex h-screen items-center justify-center">{children}</main>
    )
  }

  const navItems = allNavItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <>
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
               <ThemeToggle />
               <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CipherWallet</title>
        <meta name="description" content="A modern and secure password manager." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppContent>{children}</AppContent>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}