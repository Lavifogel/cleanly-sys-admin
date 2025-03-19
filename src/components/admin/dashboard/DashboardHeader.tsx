
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { logout, isLoggingOut } = useUserData();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call the logout function from useUserData hook
    logout();
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
          disabled={isLoggingOut}
          className="flex items-center gap-1"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
