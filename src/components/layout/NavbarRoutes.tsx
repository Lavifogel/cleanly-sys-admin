
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getNavRoutes } from '@/utils/navbarUtils';
import { useLocation } from 'react-router-dom';

interface NavbarRoutesProps {
  userRole: string | null;
  className?: string;
}

const NavbarRoutes = ({ userRole, className }: NavbarRoutesProps) => {
  const location = useLocation();
  const routes = getNavRoutes(true, userRole); // Assuming we're always authenticated for the routes

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className={className}>
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
  );
};

export default NavbarRoutes;
