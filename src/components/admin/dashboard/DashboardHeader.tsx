
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/App";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout first to clear authentication state
    logout();
    // Then navigate to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage cleaners, assign tasks, and monitor cleaning operations
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
