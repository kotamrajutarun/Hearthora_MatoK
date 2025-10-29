import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link href="/">
          <a className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2" data-testid="link-home">
            <div className="text-2xl font-bold text-primary">Hearthora</div>
          </a>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for services..."
              className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-search"
            />
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link href="/providers">
            <a>
              <Button variant="ghost" data-testid="link-providers">
                Browse Providers
              </Button>
            </a>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoUrl} alt={`${user?.firstName} ${user?.lastName}`} />
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
                {user?.role === 'provider' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/provider">
                      <a className="w-full flex items-center gap-2" data-testid="link-dashboard">
                        <User className="h-4 w-4" />
                        Dashboard
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">
                      <a className="w-full flex items-center gap-2" data-testid="link-admin">
                        <User className="h-4 w-4" />
                        Admin Panel
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <a>
                  <Button variant="ghost" data-testid="link-login">
                    Login
                  </Button>
                </a>
              </Link>
              <Link href="/register">
                <a>
                  <Button data-testid="link-register">
                    Sign Up
                  </Button>
                </a>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
