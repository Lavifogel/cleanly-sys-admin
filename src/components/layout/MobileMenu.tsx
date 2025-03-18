
import { NavLink } from "react-router-dom";
import { getNavRoutes } from "@/utils/navbarUtils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  userRole: string | null;
  onClose: () => void;
  onProfileClick: () => void;
  shouldHideProfileIcon: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const MobileMenu = ({ 
  isOpen, 
  userRole, 
  onClose, 
  onProfileClick, 
  shouldHideProfileIcon,
  isAuthenticated,
  onLogout
}: MobileMenuProps) => {
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

        {isAuthenticated && onLogout && (
          <Button 
            variant="ghost" 
            className="justify-start py-3 px-2 text-lg font-medium rounded-md hover:bg-gray-100 transition-colors mt-2" 
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
