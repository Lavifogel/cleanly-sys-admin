
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ActiveCleaningCard from "@/components/cleaners/ActiveCleaningCard";
import CleaningHistoryCard from "@/components/cleaners/CleaningHistoryCard";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { PlayIcon } from "lucide-react";

interface CleaningTabProps {
  activeCleaning: Cleaning | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  handleStartCleaning: () => void;
  handleEndCleaningWithScan: () => void;
  handleEndCleaningWithoutScan: () => void;
  togglePauseCleaning: () => void;
  handleAutoEndCleaning: () => void;
  activeShiftId?: string;
}

const CleaningTab = ({
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  handleStartCleaning,
  handleEndCleaningWithScan,
  handleEndCleaningWithoutScan,
  togglePauseCleaning,
  handleAutoEndCleaning,
  activeShiftId // Add activeShiftId prop
}: CleaningTabProps) => {
  // Auto-close cleaning after 5 hours (5 * 60 * 60 = 18000 seconds)
  useEffect(() => {
    const MAX_CLEANING_DURATION = 18000; // 5 hours in seconds
    
    if (activeCleaning && cleaningElapsedTime >= MAX_CLEANING_DURATION) {
      console.log("Cleaning exceeded 5 hours, automatically ending it");
      handleAutoEndCleaning();
    }
    
    // Clean up timer on unmount
    return () => {
      // Any cleanup if needed
    };
  }, [activeCleaning, cleaningElapsedTime, handleAutoEndCleaning]);

  return (
    <div className="space-y-6">
      {!activeCleaning ? (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold">No Active Cleaning</h2>
          <p className="text-muted-foreground">
            Start a new cleaning session by scanning a QR code.
          </p>
          <Button onClick={handleStartCleaning} className="mt-4">
            <PlayIcon className="mr-2 h-4 w-4" />
            Start Cleaning
          </Button>
        </div>
      ) : (
        <ActiveCleaningCard
          location={activeCleaning.location}
          startTime={activeCleaning.startTime}
          cleaningElapsedTime={cleaningElapsedTime}
          isPaused={activeCleaning.paused}
          onPauseCleaning={togglePauseCleaning}
          onEndCleaningWithScan={handleEndCleaningWithScan}
          onEndCleaningWithoutScan={handleEndCleaningWithoutScan}
          onAutoEndCleaning={handleAutoEndCleaning}
        />
      )}

      {cleaningsHistory.length > 0 && (
        <CleaningHistoryCard
          cleaningsHistory={cleaningsHistory}
          currentShiftId={activeShiftId}
        />
      )}
    </div>
  );
};

export default CleaningTab;
