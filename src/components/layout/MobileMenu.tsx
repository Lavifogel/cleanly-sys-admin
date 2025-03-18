
import { NavLink } from "react-router-dom";
import { getNavRoutes } from "@/utils/navbarUtils";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  userRole: string | null;
  onClose: () => void;
  onProfileClick: () => void;
  shouldHideProfileIcon: boolean;
  isAuthenticated: boolean;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  userRole,
  onClose,
  onProfileClick,
  shouldHideProfileIcon,
  isAuthenticated,
  onLogout,
  isLoggingOut = false
}) => {
  if (!isOpen) return null;

  const routes = getNavRoutes({ user: 'authenticated' }, userRole);

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-sm pt-20">
      <div className="container mx-auto px-4 py-4 flex flex-col">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => `
              py-3 px-2 text-lg font-medium rounded-md transition-colors
              ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}
            `}
            onClick={onClose}
          >
            {route.label}
          </NavLink>
        ))}
        
        {!shouldHideProfileIcon && (
          <button
            className="flex items-center gap-2 py-3 px-2 text-lg font-medium rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => {
              onProfileClick();
              onClose();
            }}
          >
            Profile
          </button>
        )}

        {isAuthenticated && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 w-full justify-start"
            onClick={() => {
              onLogout();
              onClose();
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
