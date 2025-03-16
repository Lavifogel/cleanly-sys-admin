
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardTabs from "@/components/admin/dashboard/DashboardTabs";

const AdminDashboard = () => {
  const { stats, loading, refreshData } = useAdminDashboardData();
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleNavigateBack} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
        </div>
        <DashboardHeader />
        <DashboardTabs stats={stats} loading={loading} refreshData={refreshData} />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
