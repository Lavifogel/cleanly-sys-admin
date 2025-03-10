
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Timer, ClipboardCheck } from "lucide-react";

interface ShiftHistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  cleanings: number;
}

interface ShiftHistoryCardProps {
  shiftsHistory: ShiftHistoryItem[];
}

const ShiftHistoryCard = ({ shiftsHistory }: ShiftHistoryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift History</CardTitle>
        <CardDescription>View your past shifts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shiftsHistory.map((shift) => (
            <div key={shift.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-card">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                      <h4 className="font-medium">{shift.date}</h4>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <p>{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded">
                    <Timer className="h-3 w-3 mr-1 text-primary" />
                    {shift.duration}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex items-center">
                  <ClipboardCheck className="h-3 w-3 mr-1" />
                  {shift.cleanings} cleanings completed
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftHistoryCard;
