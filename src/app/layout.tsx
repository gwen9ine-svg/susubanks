

'use client'

import Link from 'next/link'
import {
  CircleDollarSign,
  HandCoins,
  Home,
  Settings,
  Users2,
  Receipt,
  Landmark,
  User,
  LogOut,
  ShieldCheck,
  UserPlus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { SusuLogo } from '@/components/icons'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import React, { useEffect, useState } from 'react'
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});


const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/contributions', icon: HandCoins, label: 'My Contributions', adminLabel: 'Contributions' },
  { href: '/withdrawals', icon: Landmark, label: 'Withdrawals' },
  { href: '/transactions', icon: Receipt, label: 'Transactions' },
]

const adminNavItems = [
  { href: '/admin/users', icon: Users2, label: 'Registered Users' },
  { href: '/admin/transactions', icon: ShieldCheck, label: 'User Requests' },
  { href: '/admin/add-member', icon: UserPlus, label: 'Add Member' },
]


function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    // If no user role and not on an auth page, redirect to login
    if (!role && !pathname.startsWith('/auth')) {
        router.push('/auth/login');
        return;
    }
    
    setUserRole(role);
    setUserName(name);

  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href

  const getAvatarFallback = () => {
    if (!userName) return 'U';
    const parts = userName.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  }
  
  // Render auth layout for auth pages
  if (pathname.startsWith('/auth')) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            {children}
        </main>
      );
  }
  
  // Don't render layout if user is not set (and we are not on an auth page)
  // This prevents a flash of the main layout before redirecting to login.
  if (!userRole) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div className="flex w-full items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
                <SusuLogo />
            </div>
            <div className="hidden size-8 items-center justify-center group-data-[collapsible=icon]:flex">
                <CircleDollarSign className="size-5 text-primary"/>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const label = userRole === 'admin' && item.adminLabel ? item.adminLabel : item.label;
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={{ children: label }}
                      >
                        <span>
                          <item.icon />
                          <span>{label}</span>
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
              {userRole === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <Badge variant="outline" className="w-full justify-start group-data-[collapsible=icon]:hidden mt-4 mb-2 -ml-1">Admin</Badge>
                  </SidebarMenuItem>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} passHref>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          tooltip={{ children: item.label }}
                        >
                            <span>
                            <item.icon />
                            <span>{item.label}</span>
                          </span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer group-data-[collapsible=icon]:justify-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person avatar" alt="@shadcn" />
                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                         <span className="text-sm font-medium text-sidebar-foreground">{userName || 'User'}</span>
                         <span className="text-xs text-sidebar-foreground/70 capitalize">{userRole || 'User'}</span>
                      </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center w-full"><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center w-full"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Breadcrumbs can go here */}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-body antialiased ${ptSans.variable}`}>
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
