
'use client'

import Link from 'next/link'
import {
  CircleDollarSign,
  HandCoins,
  Home,
  LineChart,
  Package,
  PanelLeft,
  Settings,
  ShieldCheck,
  Users2,
  Receipt,
  Landmark,
  FileCog,
  User,
  LogOut,
  BrainCircuit,
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

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/contributions', icon: HandCoins, label: 'Contributions' },
  { href: '/withdrawals', icon: Landmark, label: 'Withdrawals' },
  { href: '/transactions', icon: Receipt, label: 'Transactions' },
]

const adminNavItems = [
  { href: '/admin/users', icon: Users2, label: 'Users Directory' },
  { href: '/admin/transactions', icon: ShieldCheck, label: 'Admin Transactions' },
]


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
              {userRole === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <Badge variant="outline" className="w-full justify-start group-data-[collapsible=icon]:hidden mt-4 mb-2 -ml-1">Admin</Badge>
                  </SidebarMenuItem>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} legacyBehavior passHref>
                        <SidebarMenuButton
                          isActive={isActive(item.href)}
                          tooltip={{ children: item.label }}
                        >
                          <item.icon />
                          <span>{item.label}</span>
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
                        <AvatarFallback>{userRole === 'admin' ? 'AD' : 'US'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                         <span className="text-sm font-medium text-sidebar-foreground">{userRole === 'admin' ? 'Admin User' : 'Regular User'}</span>
                         <span className="text-xs text-sidebar-foreground/70">{userRole === 'admin' ? 'Admin' : 'User'}</span>
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
