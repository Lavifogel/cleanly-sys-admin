
import ActiveCleaningCard from "@/components/cleaners/ActiveCleaningCard";

interface CleaningTabProps {
  activeCleaning: {
    location: string;
    startTime: Date;
    paused: boolean;
  } | null;
  cleaningElapsedTime: number;
  onPauseCleaning: () => void;
  onEndCleaningWithScan: () => void;
  onEndCleaningWithoutScan: () => void;
}

const CleaningTab = ({
  activeCleaning,
  cleaningElapsedTime,
  onPauseCleaning,
  onEndCleaningWithScan,
  onEndCleaningWithoutScan
}: CleaningTabProps) => {
  if (!activeCleaning) return null;
  
  return (
    <div className="space-y-4">
      <ActiveCleaningCard 
        location={activeCleaning.location}
        startTime={activeCleaning.startTime}
        cleaningElapsedTime={cleaningElapsedTime}
        isPaused={activeCleaning.paused}
        onPauseCleaning={onPauseCleaning}
        onEndCleaningWithScan={onEndCleaningWithScan}
        onEndCleaningWithoutScan={onEndCleaningWithoutScan}
      />
    </div>
  );
};

export default CleaningTab;
