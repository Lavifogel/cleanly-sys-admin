
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";

interface ActiveShiftCardProps {
  startTime: Date;
  elapsedTime: number;
  onEndShiftWithScan: () => void;
  onEndShiftWithoutScan: () => void;
}

const ActiveShiftCard = ({
  startTime,
  elapsedTime,
  onEndShiftWithScan,
  onEndShiftWithoutScan,
}: ActiveShiftCardProps) => {
  // Format the current date as DD/MM/YYYY
  const formattedDate = startTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Shift</CardTitle>
        <CardDescription>
          Started at {startTime.toLocaleTimeString()}
          <div className="mt-1">{formattedDate}</div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveShiftCard;
