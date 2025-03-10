import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
};

const ProtectedRoute = ({ 
  allowedRoles = [],
  redirectTo = "/auth"
}: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles specified and user role doesn't match, redirect
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    // Redirect admins to admin dashboard and cleaners to cleaner dashboard
    const redirectPath = profile.role === "admin" ? "/admin/dashboard" : "/cleaners/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
