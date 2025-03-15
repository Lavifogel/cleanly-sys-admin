
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardTabs from "@/components/cleaners/dashboard/DashboardTabs";
import { Shift } from "@/hooks/useShift";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { useEffect } from "react";

interface DashboardContentProps {
  activeShift: Shift | null;
  elapsedTime: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeCleaning: Cleaning | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  shiftsHistory: any[];
  togglePauseCleaning: () => void;
  handleEndShiftWithScan: () => void;
  handleEndShiftWithoutScan: () => void;
  handleStartCleaning: () => void;
  handleEndCleaningWithScan: () => void;
  handleEndCleaningWithoutScan: () => void;
  handleAutoEndShift: () => void;
  handleAutoEndCleaning?: () => void;
}

const DashboardContent = ({
  activeShift,
  elapsedTime,
  activeTab,
  setActiveTab,
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  shiftsHistory,
  togglePauseCleaning,
  handleEndShiftWithScan,
  handleEndShiftWithoutScan,
  handleStartCleaning,
  handleEndCleaningWithScan,
  handleEndCleaningWithoutScan,
  handleAutoEndShift,
  handleAutoEndCleaning
}: DashboardContentProps) => {
  // Get navigate function
  const navigate = () => {
    window.location.href = '/';
  };

  // Auto-close shift after 16 hours (16 * 60 * 60 = 57600 seconds)
  useEffect(() => {
    const MAX_SHIFT_DURATION = 57600; // 16 hours in seconds
    
    if (activeShift && elapsedTime >= MAX_SHIFT_DURATION) {
      console.log("Shift exceeded 16 hours, automatically ending it");
      handleAutoEndShift();
    }
  }, [activeShift, elapsedTime, handleAutoEndShift]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={navigate} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>
      
      {/* Always show tabs since we're guaranteed an active shift */}
      <DashboardTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeShift={activeShift!}
        elapsedTime={elapsedTime}
        activeCleaning={activeCleaning}
        cleaningElapsedTime={cleaningElapsedTime}
        cleaningsHistory={cleaningsHistory}
        shiftsHistory={shiftsHistory}
        togglePauseCleaning={togglePauseCleaning}
        handleEndShiftWithScan={handleEndShiftWithScan}
        handleEndShiftWithoutScan={handleEndShiftWithoutScan}
        handleStartCleaning={handleStartCleaning}
        handleEndCleaningWithScan={handleEndCleaningWithScan}
        handleEndCleaningWithoutScan={handleEndCleaningWithoutScan}
        handleAutoEndCleaning={handleAutoEndCleaning}
      />
    </motion.div>
  );
};

export default DashboardContent;
