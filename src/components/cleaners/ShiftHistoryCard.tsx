
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Timer, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecentCleaningsCard from "./RecentCleaningsCard";
import { CleaningHistoryItem } from "@/types/cleaning";

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
  const [selectedShift, setSelectedShift] = useState<ShiftHistoryItem | null>(null);
  
  // Mock cleaning data for demonstration - in a real app, this would come from an API
  const mockCleanings: CleaningHistoryItem[] = [
    {
      id: "1",
      location: "Meeting Room A",
      date: "2023-08-15",
      startTime: "09:15",
      endTime: "09:45",
      duration: "30m",
      status: "finished with scan",
      images: 2,
      notes: "Regular cleaning",
      shiftId: "1",
      imageUrls: ["/lovable-uploads/9433ba26-0e8c-4dbe-a022-8df6a3e1468f.png"]
    },
    {
      id: "2",
      location: "Office Space 101",
      date: "2023-08-15",
      startTime: "10:00",
      endTime: "10:30",
      duration: "30m",
      status: "finished with scan",
      images: 1,
      notes: "Deep cleaning required next time",
      shiftId: "1",
      imageUrls: ["/lovable-uploads/9433ba26-0e8c-4dbe-a022-8df6a3e1468f.png"]
    },
    {
      id: "3",
      location: "Bathroom Floor 2",
      date: "2023-08-15",
      startTime: "11:00",
      endTime: "11:45",
      duration: "45m",
      status: "finished with scan",
      images: 3,
      notes: "Restocked supplies",
      shiftId: "1",
      imageUrls: ["/lovable-uploads/9433ba26-0e8c-4dbe-a022-8df6a3e1468f.png"]
    },
    {
      id: "4",
      location: "Kitchen Area",
      date: "2023-08-14",
      startTime: "09:00",
      endTime: "09:30",
      duration: "30m",
      status: "finished with scan",
      images: 1,
      notes: "Regular cleaning",
      shiftId: "2",
      imageUrls: ["/lovable-uploads/9433ba26-0e8c-4dbe-a022-8df6a3e1468f.png"]
    }
  ];

  // Filter cleanings by selected shift
  const filteredCleanings = mockCleanings.filter(
    cleaning => cleaning.shiftId === selectedShift?.id
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shift History</CardTitle>
          <CardDescription>View your past shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shiftsHistory.map((shift) => (
              <div 
                key={shift.id} 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedShift(shift)}
              >
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

      {/* Dialog for displaying cleanings in the selected shift */}
      <Dialog open={selectedShift !== null} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Cleanings on {selectedShift?.date} ({selectedShift?.startTime} - {selectedShift?.endTime})
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <RecentCleaningsCard 
              cleaningsHistory={filteredCleanings} 
              currentShiftId={selectedShift?.id}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShiftHistoryCard;
