
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/ui/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ProfileTab from '@/components/cleaners/dashboard/ProfileTab';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [shiftsHistory, setShiftsHistory] = useState([]);
  const location = useLocation();

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

  // Fetch shifts history for profile
  useEffect(() => {
    const fetchShiftsHistory = async () => {
      if (session?.user && userRole === 'cleaner') {
        const { data } = await supabase
          .from('shifts')
          .select('*')
          .eq('cleaner_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setShiftsHistory(data);
        }
      }
    };

    fetchShiftsHistory();
  }, [session, userRole]);

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
        <div className="flex items-center space-x-1">
          <nav className="hidden md:flex items-center space-x-1 mr-2">
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

          {session && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setProfileOpen(true)}
              className="ml-2"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
          
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

      {/* Profile Sheet */}
      {session && (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ProfileTab shiftsHistory={shiftsHistory} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
};

export default Navbar;
