
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export const NavbarRoutes = () => {
  const { userRole } = useAuth();

  return (
    <div className="flex gap-x-2 ml-auto">
      {userRole === "admin" && (
        <Link
          to="/admin/dashboard"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Admin
        </Link>
      )}
      {userRole === "cleaner" && (
        <Link
          to="/cleaners/dashboard"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
      )}
    </div>
  );
};
