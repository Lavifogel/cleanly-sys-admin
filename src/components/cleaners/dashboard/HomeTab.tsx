
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
  cleaningsHistory: CleaningHistoryItem[];
  onEndShiftWithScan: () => void;
  onEndShiftWithoutScan: () => void;
  onStartCleaning: () => void;
}

const HomeTab = ({
  activeShift,
  elapsedTime,
  activeCleaning,
  cleaningsHistory,
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
        onStartCleaning={onStartCleaning}
      />

      <RecentCleaningsCard 
        cleaningsHistory={cleaningsHistory} 
        currentShiftId={activeShift.id}
        activeCleaning={activeCleaning}
      />
    </div>
  );
};

export default HomeTab;
