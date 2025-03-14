
import { cn } from '@/lib/utils';
import { useNavbar } from '@/hooks/useNavbar';
import NavbarRoutes from './NavbarRoutes';
import ProfileButton from './ProfileButton';
import MobileMenu from './MobileMenu';
import { getNavRoutes } from '@/utils/navbarUtils';

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
        {/* User name display */}
        {userName && !isIndexPage && (
          <div className="flex items-center text-sm font-medium">
            <span>Welcome, {userName}</span>
          </div>
        )}

        {/* Desktop Navigation */}
        <NavbarRoutes 
          routes={routes} 
          isActive={isActive} 
          className="hidden md:flex items-center space-x-1 ml-auto" 
        />

        {/* Profile Button - hidden on login, index pages, and for admin users */}
        {!shouldHideProfileIcon && (
          <ProfileButton onClick={handleProfileClick} />
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} routes={routes} isActive={isActive} />
    </header>
  );
};

export default Navbar;
