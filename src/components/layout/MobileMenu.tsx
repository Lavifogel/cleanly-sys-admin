
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavRoute } from '@/utils/navbarUtils';

interface MobileMenuProps {
  isOpen: boolean;
  routes: NavRoute[];
  isActive: (path: string) => boolean;
}

const MobileMenu = ({ isOpen, routes, isActive }: MobileMenuProps) => {
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
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileMenu;
