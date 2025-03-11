
import { motion } from "framer-motion";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardTabs from "@/components/admin/dashboard/DashboardTabs";

const AdminDashboard = () => {
  const { stats, loading, refreshData } = useAdminDashboardData();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader />
        <DashboardTabs stats={stats} loading={loading} />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
