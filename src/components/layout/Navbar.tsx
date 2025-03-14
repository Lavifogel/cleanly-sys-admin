
import { cn } from '@/lib/utils';
import { useNavbar } from '@/hooks/useNavbar';
import NavbarRoutes from './NavbarRoutes';
import ProfileButton from './ProfileButton';
import MobileMenu from './MobileMenu';
import { getNavRoutes } from '@/utils/navbarUtils';
import { Check, Sparkles } from 'lucide-react';

const Navbar = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    userRole,
    userName,
    location,
    navigate,
    session,
    isIndexPage,
    shouldHideProfileIcon
  } = useNavbar();

  const routes = getNavRoutes(session, userRole);

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
        {/* Left section with logo and username */}
        <div className="flex items-center gap-4">
          {/* Logo (non-interactive) */}
          <div 
            className="flex items-center gap-2 pointer-events-none" 
            aria-hidden="true"
          >
            {/* Logo icon */}
            <div className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 h-8 w-8">
              <Check className="absolute h-3/5 w-3/5" strokeWidth={3} />
              <div className="absolute right-0 bottom-0 -translate-x-px -translate-y-px">
                <Sparkles className="h-2/5 w-2/5 text-amber-300" />
              </div>
            </div>
            {/* Logo text */}
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold tracking-tight leading-none">
                <span className="text-blue-600">Cleaners</span>
                <span className="text-indigo-700">Check</span>
              </span>
              <span className="text-xs text-muted-foreground">Smart Cleaning Management</span>
            </div>
          </div>

          {/* User name display */}
          {userName && !isIndexPage && (
            <div className="flex items-center text-sm font-medium ml-2">
              <span>Welcome, {userName}</span>
            </div>
          )}
        </div>

        {/* Right section with navigation and profile */}
        <div className="flex items-center space-x-2">
          {/* Desktop Navigation */}
          <NavbarRoutes 
            routes={routes} 
            isActive={isActive} 
            className="hidden md:flex items-center space-x-1" 
          />

          {/* Profile Button - hidden on login, index pages, and for admin users */}
          {!shouldHideProfileIcon && (
            <ProfileButton onClick={handleProfileClick} />
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} routes={routes} isActive={isActive} />
    </header>
  );
};

export default Navbar;
