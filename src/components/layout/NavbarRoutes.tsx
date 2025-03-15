
import { Link } from "react-router-dom";
import { NavRoute } from "@/utils/navbarUtils";
import { cn } from "@/lib/utils";

interface NavbarRoutesProps {
  routes: NavRoute[];
  isActive: (path: string) => boolean;
  className?: string;
}

export const NavbarRoutes = ({ routes, isActive, className }: NavbarRoutesProps) => {
  return (
    <div className={cn("flex gap-x-2", className)}>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={cn(
            "text-sm font-medium transition-colors",
            isActive(route.path) 
              ? "text-primary" 
              : "hover:text-primary"
          )}
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
};
