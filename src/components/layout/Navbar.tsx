import { useNavbar } from "@/hooks/useNavbar";
import NavbarRoutes from "./NavbarRoutes";
import MobileMenu from "./MobileMenu";
import ProfileButton from "./ProfileButton";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

const Navbar = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userRole,
    userName,
    location,
    navigate,
    isLoginPage,
    isIndexPage,
    isAdminPage,
    shouldHideProfileIcon
  } = useNavbar();

  const { 
    isAuthenticated, 
    logout, 
    isLoggingOut, 
    showLogoutConfirmation, 
    hasActiveShift,
    performLogout,
    closeLogoutConfirmation
  } = useUserData();

  const handleProfileClick = () => {
    if (location.pathname.includes("/cleaners/dashboard")) {
      // If already on dashboard, switch to profile tab
      const event = new CustomEvent('set-active-tab', { detail: 'profile' });
      window.dispatchEvent(event);
    } else {
      // Otherwise navigate to cleaners dashboard
      navigate("/cleaners/dashboard");
      
      // Set profile tab after navigation
      setTimeout(() => {
        const event = new CustomEvent('set-active-tab', { detail: 'profile' });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  // Hide navbar on login page
  if (isLoginPage) {
    return null;
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
          ${isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-white/80'}
        `}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavbarRoutes userRole={userRole} />
            
            {!shouldHideProfileIcon && isAuthenticated && (
              <>
                <ProfileButton onClick={handleProfileClick} />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center p-2 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <div className="relative w-6 h-5">
              <span 
                className={`block absolute h-0.5 bg-gray-700 transform transition-all duration-300 ${
                  isMobileMenuOpen ? 'top-2 -rotate-45 w-6' : 'top-0 w-5'
                }`}
              />
              <span 
                className={`block absolute h-0.5 bg-gray-700 top-2 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 w-0' : 'opacity-100 w-6'
                }`}
              />
              <span 
                className={`block absolute h-0.5 bg-gray-700 transform transition-all duration-300 ${
                  isMobileMenuOpen ? 'top-2 rotate-45 w-6' : 'top-4 w-4'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          userRole={userRole} 
          onClose={() => setIsMobileMenuOpen(false)}
          onProfileClick={handleProfileClick}
          shouldHideProfileIcon={shouldHideProfileIcon && !isAuthenticated}
          isAuthenticated={isAuthenticated}
          onLogout={logout}
          isLoggingOut={isLoggingOut}
        />
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutConfirmation}
        onClose={closeLogoutConfirmation}
        onConfirm={performLogout}
        hasActiveShift={hasActiveShift}
      />
    </>
  );
};

export default Navbar;
