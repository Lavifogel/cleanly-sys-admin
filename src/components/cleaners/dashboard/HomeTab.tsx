
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
}

const HomeTab = ({
  activeShift,
  elapsedTime,
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  shiftsHistory, // Adding the missing prop
  onEndShiftWithScan,
  onEndShiftWithoutScan,
  onStartCleaning
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
      />
    </div>
  );
};

export default HomeTab;
