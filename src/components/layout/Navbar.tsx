import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/ui/logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is login or index page
  const isLoginPage = location.pathname === '/login';
  const isIndexPage = location.pathname === '/';
  const shouldHideProfileIcon = isLoginPage || isIndexPage;

  // Fetch user session and role
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch user profile to get role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserProfile();
  }, [session]);

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

  // Define routes based on authentication status and role
  const getRoutes = () => {
    // If user is not logged in, don't show any routes
    if (!session) {
      return [];
    }

    // If user is logged in, only show their relevant dashboard
    if (userRole === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' }
      ];
    } else if (userRole === 'cleaner') {
      return [
        { path: '/cleaners/dashboard', label: 'Dashboard' }
      ];
    }

    return [];
  };

  const routes = getRoutes();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle profile icon click
  const handleProfileClick = () => {
    if (location.pathname.includes('/cleaners/dashboard')) {
      // Already on dashboard, dispatch event to show profile tab
      const event = new CustomEvent('set-profile-tab');
      window.dispatchEvent(event);
    } else {
      // Navigate to dashboard with profile tab
      if (userRole === 'cleaner') {
        navigate('/cleaners/dashboard');
        // Need a delay to ensure component is mounted before trying to set tab
        setTimeout(() => {
          const event = new CustomEvent('set-profile-tab');
          window.dispatchEvent(event);
        }, 100);
      }
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6',
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Logo size="md" variant="default" />
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
        </nav>

        {/* Profile Button - hidden on login and index pages */}
        {!shouldHideProfileIcon && (
          <Button
            variant="ghost"
            size="icon"
            className="md:flex"
            onClick={handleProfileClick}
            aria-label="Profile"
          >
            <UserRound className="h-5 w-5" />
          </Button>
        )}
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
