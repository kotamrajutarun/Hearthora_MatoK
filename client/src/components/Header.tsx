import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const navLinks = [
    { label: 'Browse Providers', href: '/providers' },
    { label: 'Success Stories', href: '/success-stories' },
    { label: 'Write Review', href: '/write-review' },
    { label: 'All Categories', href: '/providers' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg md:text-xl">M</span>
            </div>
            <span className="text-xl md:text-2xl font-semibold">MatoK</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Button 
                key={link.label}
                variant="ghost" 
                onClick={() => setLocation(link.href)}
                className="text-sm whitespace-nowrap"
                data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
              >
                {link.label}
              </Button>
            ))}

            {!isAuthenticated && (
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/login')}
                className="text-sm"
                data-testid="link-login"
              >
                Login
              </Button>
            )}

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoUrl || undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                      <AvatarFallback>{user && getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.role === 'customer' && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation('/instant-browse')} data-testid="link-instant-browse">
                        Instant Browse
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/my-bookings')} data-testid="link-my-bookings">
                        My Bookings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/my-addresses')} data-testid="link-my-addresses">
                        My Addresses
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'provider' && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation('/dashboard/provider')} data-testid="link-dashboard">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/provider/price-cards')} data-testid="link-price-cards">
                        Price Cards
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/provider/availability')} data-testid="link-availability">
                        Availability
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/provider/jobs')} data-testid="link-jobs">
                        Jobs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => setLocation('/dashboard/admin')} data-testid="link-admin">
                      <User className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>


          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "lg:hidden border-t bg-background",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Button 
              key={link.label}
              variant="ghost" 
              onClick={() => {
                setLocation(link.href);
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
              data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
            >
              {link.label}
            </Button>
          ))}


          {!isAuthenticated && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setLocation('/login');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
              data-testid="mobile-link-login"
            >
              Login
            </Button>
          )}
          
          {isAuthenticated && (
            <>
              {user?.role === 'provider' && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setLocation('/dashboard/provider');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                  data-testid="mobile-link-dashboard"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                data-testid="mobile-button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
