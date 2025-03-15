
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Route {
  path: string;
  label: string;
}

interface NavbarRoutesProps {
  routes: Route[];
  isActive: (path: string) => boolean;
  className?: string;
}

const NavbarRoutes = ({ routes, isActive, className }: NavbarRoutesProps) => {
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
