
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getNavRoutes } from '@/utils/navbarUtils';
import { useLocation } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  userRole: string | null;
  onClose: () => void;
  onProfileClick: () => void;
  shouldHideProfileIcon: boolean;
}

const MobileMenu = ({ 
  isOpen, 
  userRole, 
  onClose,
  onProfileClick, 
  shouldHideProfileIcon 
}: MobileMenuProps) => {
  const location = useLocation();
  const routes = getNavRoutes(true, userRole); // Assuming we're always authenticated

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (!isOpen) return null;

  return (
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
            onClick={onClose}
          >
            {route.label}
          </Link>
        ))}
        
        {!shouldHideProfileIcon && (
          <button
            className="flex items-center px-4 py-3 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            onClick={() => {
              onProfileClick();
              onClose();
            }}
          >
            Profile
          </button>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
