import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Shield, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 transition-smooth hover:opacity-80"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Snippets</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">Explore</Link>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/my-wall" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Wall
                  </Link>
                </Button>
                
                {isAdmin && (
                  <Button variant="soft" asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                
                <Button variant="ghost" size="icon-sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-smooth"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
              </Button>

              {user ? (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/my-wall" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Wall
                    </Link>
                  </Button>
                  
                  {isAdmin && (
                    <Button variant="soft" asChild className="justify-start">
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button variant="hero" asChild className="justify-center">
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
