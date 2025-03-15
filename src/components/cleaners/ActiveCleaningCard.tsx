
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, PauseCircle, Scan } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";
import { useEffect } from "react";
import { Cleaning } from "@/types/cleaning";

interface ActiveCleaningCardProps {
  location: string;
  startTime: Date;
  cleaningElapsedTime: number;
  isPaused: boolean;
  onPauseCleaning: () => void;
  onEndCleaningWithScan: () => void;
  onEndCleaningWithoutScan: () => void;
  onAutoEndCleaning?: () => void;
  // Add the cleaning prop as an alternative way to provide data
  cleaning?: Cleaning;
}

const ActiveCleaningCard = ({
  location,
  startTime,
  cleaningElapsedTime,
  isPaused,
  onPauseCleaning,
  onEndCleaningWithScan,
  onEndCleaningWithoutScan,
  onAutoEndCleaning,
  cleaning, // Add the cleaning prop
}: ActiveCleaningCardProps) => {
  // If cleaning is provided, use its properties instead
  const actualLocation = cleaning?.location || location;
  const actualStartTime = cleaning?.startTime || startTime;
  const actualIsPaused = cleaning?.paused ?? isPaused;

  // Auto-close cleaning after 5 hours (5 * 60 * 60 = 18000 seconds)
  useEffect(() => {
    const MAX_CLEANING_DURATION = 18000; // 5 hours in seconds
    
    if (!actualIsPaused && cleaningElapsedTime >= MAX_CLEANING_DURATION && onAutoEndCleaning) {
      console.log("Cleaning exceeded 5 hours, automatically ending it");
      onAutoEndCleaning();
    }
  }, [cleaningElapsedTime, actualIsPaused, onAutoEndCleaning]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          {actualLocation}
        </CardTitle>
        <CardDescription>
          Started at {actualStartTime.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2">
            {formatTime(cleaningElapsedTime)}
          </div>
          <p className="text-muted-foreground">
            {actualIsPaused ? "PAUSED" : "Elapsed Time"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant={actualIsPaused ? "default" : "outline"}
            onClick={onPauseCleaning}
            className="w-full"
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            {actualIsPaused ? "Resume Cleaning" : "Pause Cleaning"}
          </Button>
          <Button
            variant="destructive"
            onClick={onEndCleaningWithScan}
            className="w-full mt-4"
          >
            <Scan className="mr-2 h-4 w-4" />
            Complete with Scan
          </Button>
          <Button
            variant="outline"
            onClick={onEndCleaningWithoutScan}
            className="w-full"
          >
            Complete without Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCleaningCard;
