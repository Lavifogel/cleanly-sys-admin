
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ClipboardCheck, Timer, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CleaningHistoryItem } from "@/types/cleaning";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import CleaningHistoryCard from "./CleaningHistoryCard";

interface ShiftHistoryCardProps {
  shiftsHistory: ShiftHistoryItem[];
  isLoading?: boolean;
}

const ShiftHistoryCard = ({ shiftsHistory, isLoading = false }: ShiftHistoryCardProps) => {
  const [selectedShift, setSelectedShift] = useState<ShiftHistoryItem | null>(null);
  const [shiftCleanings, setShiftCleanings] = useState<CleaningHistoryItem[]>([]);
  const [isLoadingCleanings, setIsLoadingCleanings] = useState(false);
  
  const handleShiftClick = async (shift: ShiftHistoryItem) => {
    console.log("Shift clicked:", shift);
    setSelectedShift(shift);
    setIsLoadingCleanings(true);
    
    try {
      // Fetch cleanings for this shift
      const { data: cleanings, error } = await supabase
        .from('cleanings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          qr_codes(area_name),
          images(id, image_url)
        `)
        .eq('shift_id', shift.id)
        .order('start_time', { ascending: false });
        
      if (error) {
        console.error('Error fetching cleanings:', error);
        setShiftCleanings([]);
        return;
      }
      
      console.log("Fetched cleanings:", cleanings);
      
      const formattedCleanings: CleaningHistoryItem[] = cleanings.map(cleaning => {
        const startTime = cleaning.start_time ? parseISO(cleaning.start_time) : new Date();
        const endTime = cleaning.end_time ? parseISO(cleaning.end_time) : null;
        
        // Calculate duration
        let duration = "In progress";
        if (endTime) {
          const durationMs = endTime.getTime() - startTime.getTime();
          const minutes = Math.floor(durationMs / (1000 * 60));
          duration = `${minutes}m`;
        }
        
        return {
          id: cleaning.id,
          location: cleaning.qr_codes?.area_name || "Unknown Location",
          date: format(startTime, 'yyyy-MM-dd'),
          startTime: format(startTime, 'HH:mm'),
          endTime: endTime ? format(endTime, 'HH:mm') : "--:--",
          duration,
          status: cleaning.status,
          images: cleaning.images?.length || 0,
          notes: cleaning.notes || "",
          shiftId: shift.id,
          imageUrls: cleaning.images?.map(img => img.image_url) || []
        };
      });
      
      console.log("Formatted cleanings:", formattedCleanings);
      setShiftCleanings(formattedCleanings);
    } catch (error) {
      console.error('Error processing cleanings data:', error);
      setShiftCleanings([]);
    } finally {
      setIsLoadingCleanings(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shift History</CardTitle>
          <CardDescription>View your past shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : shiftsHistory.length > 0 ? (
            <div className="space-y-4">
              {shiftsHistory.map((shift) => (
                <div 
                  key={shift.id} 
                  className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors p-4"
                  onClick={() => handleShiftClick(shift)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium text-lg">{shift.date}</h4>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <p>{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        <p>{shift.cleanings} cleanings completed</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium flex items-center bg-primary/10 px-3 py-1.5 rounded-full">
                      <Timer className="h-3.5 w-3.5 mr-1 text-primary" />
                      {shift.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No shift history available yet
            </div>
          )}
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
          
          {isLoadingCleanings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading cleanings...</span>
            </div>
          ) : (
            <div className="mt-4">
              <CleaningHistoryCard 
                cleaningsHistory={shiftCleanings} 
                currentShiftId={selectedShift?.id}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShiftHistoryCard;
