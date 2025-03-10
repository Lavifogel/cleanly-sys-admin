
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";

interface ActiveShiftCardProps {
  startTime: Date;
  elapsedTime: number;
  onEndShiftWithScan: () => void;
  onEndShiftWithoutScan: () => void;
  onStartCleaning: () => void;
}

const ActiveShiftCard = ({
  startTime,
  elapsedTime,
  onEndShiftWithScan,
  onEndShiftWithoutScan,
  onStartCleaning,
}: ActiveShiftCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Shift</CardTitle>
        <CardDescription>
          Started at {startTime.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold mb-2">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-muted-foreground">Elapsed Time</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={onEndShiftWithScan}
            className="w-full"
          >
            <Scan className="mr-2 h-4 w-4" />
            End Shift with Scan
          </Button>
          <Button
            variant="outline"
            onClick={onEndShiftWithoutScan}
            className="w-full"
          >
            End Shift without Scan
          </Button>
          <Button
            onClick={onStartCleaning}
            className="w-full mt-4"
          >
            <Scan className="mr-2 h-4 w-4" />
            Scan to Start Cleaning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveShiftCard;
