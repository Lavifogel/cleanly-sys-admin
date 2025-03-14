
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import CleanerNavigation from "@/components/cleaners/navigation/CleanerNavigation";
import { motion } from "framer-motion";
import ProfileContent from "@/components/cleaners/dashboard/ProfileContent";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CleanersProfile = () => {
  const {
    activeShift,
    shiftsHistory,
    cleaningsHistory,
  } = useDashboardHandlers();

  const navigate = useNavigate();

  // Redirect to dashboard if no active shift
  useEffect(() => {
    if (!activeShift) {
      navigate('/cleaners/dashboard');
    }
  }, [activeShift, navigate]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CleanerNavigation active="profile" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <ProfileContent 
          shiftsHistory={shiftsHistory}
          cleaningsHistory={cleaningsHistory}
        />
      </motion.div>
    </div>
  );
};

export default CleanersProfile;
