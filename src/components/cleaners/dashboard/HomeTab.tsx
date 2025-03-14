
import ActiveShiftCard from "@/components/cleaners/ActiveShiftCard";
import RecentCleaningsCard from "@/components/cleaners/RecentCleaningsCard";
import { CleaningHistoryItem } from "@/types/cleaning";

interface HomeTabProps {
  activeShift: {
    id: string;
    startTime: Date;
  };
  elapsedTime: number;
  activeCleaning: {
    location: string;
    startTime: Date;
  } | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  shiftsHistory: any[]; // Adding the missing prop
  onEndShiftWithScan: () => void;
  onEndShiftWithoutScan: () => void;
  onStartCleaning: () => void;
  onSwitchToCleaningTab?: () => void; // New prop for switching to cleaning tab
}

const HomeTab = ({
  activeShift,
  elapsedTime,
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  shiftsHistory,
  onEndShiftWithScan,
  onEndShiftWithoutScan,
  onStartCleaning,
  onSwitchToCleaningTab
}: HomeTabProps) => {
  return (
    <div className="space-y-4">
      <ActiveShiftCard 
        startTime={activeShift.startTime}
        elapsedTime={elapsedTime}
        onEndShiftWithScan={onEndShiftWithScan}
        onEndShiftWithoutScan={onEndShiftWithoutScan}
      />

      <RecentCleaningsCard 
        cleaningsHistory={cleaningsHistory} 
        currentShiftId={activeShift.id}
        activeCleaning={activeCleaning}
        cleaningElapsedTime={cleaningElapsedTime}
        onStartCleaning={onStartCleaning}
        onActiveCleaningClick={onSwitchToCleaningTab} // Pass the navigation handler
      />
    </div>
  );
};

export default HomeTab;
