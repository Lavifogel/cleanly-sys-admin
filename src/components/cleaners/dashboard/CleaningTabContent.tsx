
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import ActiveCleaningCard from "@/components/cleaners/ActiveCleaningCard";
import CleaningHistoryCard from "@/components/cleaners/CleaningHistoryCard";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CleaningTabContentProps {
  activeCleaning: Cleaning | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  activeShiftId?: string;
  handleStartCleaning: () => void;
  handleEndCleaningWithScan: () => void;
  handleEndCleaningWithoutScan: () => void;
  togglePauseCleaning: () => void;
  handleAutoEndCleaning: () => void;
}

const CleaningTabContent = ({
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  activeShiftId,
  handleStartCleaning,
  handleEndCleaningWithScan,
  handleEndCleaningWithoutScan,
  togglePauseCleaning
}: CleaningTabContentProps) => {
  return (
    <div className="space-y-6">
      {activeCleaning ? (
        <ActiveCleaningCard
          cleaning={activeCleaning}
          elapsedTime={cleaningElapsedTime}
          onPauseToggle={togglePauseCleaning}
          onEndCleaningWithScan={handleEndCleaningWithScan}
          onEndCleaningWithoutScan={handleEndCleaningWithoutScan}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Cleaning</CardTitle>
            <CardDescription>Scan a QR code to start a new cleaning task</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleStartCleaning}
              className="w-full"
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan to Start Cleaning
            </Button>
          </CardContent>
        </Card>
      )}

      <CleaningHistoryCard 
        cleanings={cleaningsHistory}
        title="Cleanings History"
        emptyMessage="No cleanings in your history yet"
      />
    </div>
  );
};

export default CleaningTabContent;
