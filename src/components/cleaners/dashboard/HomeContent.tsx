
import { Shift } from "@/hooks/useShift";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import ActiveShiftCard from "@/components/cleaners/ActiveShiftCard";
import RecentCleaningsCard from "@/components/cleaners/RecentCleaningsCard";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HomeContentProps {
  activeShift: Shift;
  elapsedTime: number;
  activeCleaning: Cleaning | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  shiftsHistory: any[];
  handleEndShiftWithScan: () => void;
  handleEndShiftWithoutScan: () => void;
  handleStartCleaning: () => void;
  handleAutoEndShift: () => void;
}

const HomeContent = ({
  activeShift,
  elapsedTime,
  activeCleaning,
  cleaningsHistory,
  handleEndShiftWithScan,
  handleEndShiftWithoutScan,
  handleStartCleaning
}: HomeContentProps) => {
  return (
    <div className="space-y-6">
      <ActiveShiftCard
        startTime={activeShift.startTime}
        elapsedTime={elapsedTime}
        onEndShiftWithScan={handleEndShiftWithScan}
        onEndShiftWithoutScan={handleEndShiftWithoutScan}
      />

      {!activeCleaning && (
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

      <RecentCleaningsCard 
        cleanings={cleaningsHistory.slice(0, 5)}
        activeCleaning={activeCleaning}
      />
    </div>
  );
};

export default HomeContent;
