
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthGuard = () => {
  const { isAuthenticated, loading, userRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is trying to access admin dashboard without admin role
  if (location.pathname.includes('/admin') && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If user is trying to access cleaner dashboard without cleaner role
  if (location.pathname.includes('/cleaners') && userRole !== 'cleaner') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
