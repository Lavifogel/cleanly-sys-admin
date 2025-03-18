
import { memo } from "react";
import { motion } from "framer-motion";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardTabs from "@/components/admin/dashboard/DashboardTabs";

// Memoized dashboard component to prevent unnecessary re-renders
const AdminDashboard = memo(() => {
  const { stats, loading, refreshData } = useAdminDashboardData();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} // Reduced from 0.5 to 0.3 for faster animation
        layout // Add layout animation for smoother transitions
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
