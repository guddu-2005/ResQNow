
"use client";

import { Menu, User, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/report', label: 'Report' },
  { href: '/first-aid', label: 'First Aid' },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleMobileLinkClick = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  }

  const handleSignOut = () => {
      signOut();
      setIsMobileMenuOpen(false);
  }

  const NavLink = ({ href, label, className, inSheet = false }: { href: string; label: string, className?: string, inSheet?: boolean }) => (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-primary',
        pathname === href ? 'text-primary font-semibold' : 'text-muted-foreground',
        className
      )}
      onClick={() => inSheet && setIsMobileMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>

        {/* Mobile Header */}
        <div className="flex w-full items-center justify-between md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col">
                 <div className="p-4 border-b">
                  <Logo />
                </div>
                <nav className="mt-4 flex flex-col gap-1 p-4 flex-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        'justify-start text-lg h-12',
                        pathname === link.href ? 'text-primary bg-accent' : 'text-foreground'
                      )}
                      onClick={() => handleMobileLinkClick(link.href)}
                    >
                      {link.label}
                    </Button>
                  ))}
                </nav>
                 <Separator />
                 <div className="p-4">
                  {user ? (
                      <div className="flex flex-col gap-1">
                         <Button variant="ghost" className="justify-start text-lg h-12" onClick={() => handleMobileLinkClick('/dashboard')}>
                            <User className="mr-2 h-5 w-5" />
                            <span>Dashboard</span>
                        </Button>
                         <Button variant="ghost" className="justify-start text-lg h-12" onClick={() => handleMobileLinkClick('/settings')}>
                            <Settings className="mr-2 h-5 w-5" />
                            <span>Settings</span>
                        </Button>
                         <Button variant="ghost" className="justify-start text-lg h-12 text-destructive hover:text-destructive" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-5 w-5" />
                            <span>Sign Out</span>
                        </Button>
                      </div>
                  ) : (
                      <div className="flex flex-col gap-2">
                           <Button className="w-full h-12 text-lg" onClick={() => handleMobileLinkClick('/login')}>
                                <LogIn className="mr-2 h-5 w-5" />
                                Login
                           </Button>
                           <Button variant="secondary" className="w-full h-12 text-lg" onClick={() => handleMobileLinkClick('/signup')}>
                                <UserPlus className="mr-2 h-5 w-5" />
                                Sign Up
                           </Button>
                      </div>
                  )}
                 </div>
              </SheetContent>
            </Sheet>
            <Logo />
        </div>


        {/* Desktop Header */}
        <div className="hidden md:flex md:w-auto md:flex-1">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>


        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
           <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || undefined} />
                        <AvatarFallback>
                          <Menu />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
           </div>
        </div>
      </div>
    </header>
  );
}
