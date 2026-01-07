import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Zap, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

export function Navbar() {
  const { credits, isAuthenticated, signOut, user } = useApp();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Scrapewave</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && !isLanding && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm transition-colors py-1 border-b-2 ${location.pathname === '/dashboard'
                      ? 'text-foreground border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/modules"
                  className={`text-sm transition-colors py-1 border-b-2 ${location.pathname.startsWith('/modules')
                      ? 'text-foreground border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                  Modules
                </Link>
                <Link
                  to="/results"
                  className={`text-sm transition-colors py-1 border-b-2 ${location.pathname === '/results'
                      ? 'text-foreground border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                  Results
                </Link>
                <Link
                  to="/billing"
                  className={`text-sm transition-colors py-1 border-b-2 ${location.pathname === '/billing'
                      ? 'text-foreground border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                  Billing
                </Link>
                <Link
                  to="/developer"
                  className={`text-sm transition-colors py-1 border-b-2 ${location.pathname === '/developer'
                      ? 'text-foreground border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                    }`}
                >
                  Developer
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated && !isLanding && (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{(credits ?? 0).toLocaleString()}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {profile?.display_name
                            ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.display_name && (
                        <span className="text-sm font-medium max-w-[120px] truncate">
                          {profile.display_name}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {isLanding && (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/billing">
                  <Button variant="ghost" size="sm">
                    Pricing
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {profile?.display_name
                        ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {profile?.display_name || user?.email}
                  </span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{(credits ?? 0).toLocaleString()} credits</span>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/modules"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Modules
                </Link>
                <Link
                  to="/results"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Results
                </Link>
                <Link
                  to="/billing"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Billing
                </Link>
                <Link
                  to="/developer"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developer
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/billing"
                  className="block px-3 py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
