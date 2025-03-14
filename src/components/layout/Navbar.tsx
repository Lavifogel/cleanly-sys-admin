import { cn } from '@/lib/utils';
import { useNavbar } from '@/hooks/useNavbar';
import NavbarRoutes from './NavbarRoutes';
import ProfileButton from './ProfileButton';
import MobileMenu from './MobileMenu';
import { getNavRoutes } from '@/utils/navbarUtils';
import Logo from '@/components/ui/logo';

const Navbar = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    userRole,
    userName,
    navigate,
    location,
    session,
    isIndexPage,
    shouldHideProfileIcon
  } = useNavbar();

  const routes = getNavRoutes(session, userRole);

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Check if current page is cleaner dashboard
  const isCleanerDashboard = location.pathname.includes('/cleaners/dashboard');

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

  // Handle logo click - navigate to index page
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6',
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left section with welcome text */}
        <div className="flex-1">
          {userName && !isIndexPage && (
            <div className="flex items-center text-sm font-medium">
              <span>Welcome, {userName}</span>
            </div>
          )}
        </div>

        {/* Center section with logo */}
        <div className="flex-1 flex justify-center">
          {/* Logo (always interactive) */}
          <Logo 
            variant="default"
            size="md"
            onClick={handleLogoClick}
            className="cursor-pointer"
          />
        </div>

        {/* Right section with navigation and profile */}
        <div className="flex-1 flex items-center justify-end space-x-2">
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
