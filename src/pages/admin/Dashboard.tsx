
import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardTabs from "@/components/admin/dashboard/DashboardTabs";
import { useTabActions } from "@/hooks/dashboard";

// Memoized dashboard component to prevent unnecessary re-renders
const AdminDashboard = memo(() => {
  const { stats, loading, refreshData } = useAdminDashboardData();
  const { setActiveTab } = useTabActions();

  // Force a refresh when the component mounts
  useEffect(() => {
    console.log("Admin Dashboard mounted, refreshing data...");
    refreshData();
    
    // Ensure dashboard tab is selected on mount
    setActiveTab("dashboard");
  }, [refreshData, setActiveTab]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        layout
      >
        <DashboardHeader />
        <DashboardTabs stats={stats} loading={loading} refreshData={refreshData} />
      </motion.div>
    </div>
  );
});

// Add display name for React DevTools
AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;
