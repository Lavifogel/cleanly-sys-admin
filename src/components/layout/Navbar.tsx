
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Get routes based on auth status and user role
  const getRoutes = () => {
    const routes = [{ path: '/', label: 'Home' }];

    if (!user) {
      routes.push({ path: '/auth', label: 'Sign In' });
    } else if (profile) {
      if (profile.role === 'admin') {
        routes.push({ path: '/admin/dashboard', label: 'Dashboard' });
      } else {
        routes.push({ path: '/cleaners/dashboard', label: 'Dashboard' });
      }
    }

    return routes;
  };

  const routes = getRoutes();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-foreground font-semibold text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          CleanSys
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                isActive(route.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
              )}
            >
              {route.label}
            </Link>
          ))}
          
          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b animate-slide-in">
          <nav className="flex flex-col p-4 space-y-2 max-w-7xl mx-auto">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  'px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive(route.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                )}
              >
                {route.label}
              </Link>
            ))}
            
            {user && (
              <Button 
                variant="ghost"
                onClick={signOut}
                className="justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
