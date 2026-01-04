import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { credits, isAuthenticated } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';

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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/modules"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Modules
                </Link>
                <Link
                  to="/results"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Results
                </Link>
                <Link
                  to="/billing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Billing
                </Link>
                <Link
                  to="/developer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Developer
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated && !isLanding && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{credits.toLocaleString()}</span>
              </div>
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
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{credits.toLocaleString()} credits</span>
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
