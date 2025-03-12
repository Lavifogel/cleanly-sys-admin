
import { motion } from "framer-motion";
import NoShiftView from "@/components/cleaners/dashboard/NoShiftView";
import DashboardTabs from "@/components/cleaners/dashboard/DashboardTabs";
import { Shift } from "@/hooks/useShift";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";

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
  handleStartShift: () => void;
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
  handleStartShift
}: DashboardContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!activeShift ? (
        <NoShiftView onStartShift={handleStartShift} />
      ) : (
        <>
          <DashboardTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeShift={activeShift}
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
          />
        </>
      )}
    </motion.div>
  );
};

export default DashboardContent;
