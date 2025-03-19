import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ClipboardCheck, Timer, Loader2 } from "lucide-react";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ShiftHistoryCardProps {
  shiftsHistory: ShiftHistoryItem[];
  isLoading?: boolean;
}

const ShiftHistoryCard = ({ shiftsHistory, isLoading = false }: ShiftHistoryCardProps) => {
  const { toast } = useToast();
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaningsData, setCleaningsData] = useState<{
    [shiftId: string]: {
      cleanings: any[];
      loaded: boolean;
    }
  }>({});

  const toggleShift = async (shiftId: string) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null);
      return;
    }
    
    setExpandedShift(shiftId);
    
    if (cleaningsData[shiftId]?.loaded) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('cleanings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          qr_codes!start_qr_id(area_name),
          images(id, image_url)
        `)
        .eq('shift_id', shiftId)
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error("Error fetching cleanings:", error);
        throw error;
      }
      
      setCleaningsData({
        ...cleaningsData,
        [shiftId]: {
          cleanings: data || [],
          loaded: true
        }
      });
    } catch (error: any) {
      toast({
        title: "Error fetching cleanings",
        description: error.message || "Failed to get cleaning details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatStartTime = (shift: ShiftHistoryItem) => {
    const dateTime = `${shift.date} ${shift.startTime}`;
    const date = new Date(dateTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    return format(date, 'h:mm a');
  };

  const formatEndTime = (shift: ShiftHistoryItem) => {
    if (!shift.endTime) return "In progress";
    const dateTime = `${shift.date} ${shift.endTime}`;
    const date = new Date(dateTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    return format(date, 'h:mm a');
  };

  const getLocationFromNotes = (notes: string) => {
    if (!notes) return "Unknown location";
    const locationMatch = notes.match(/Location:\s*([^,\n]*)/i);
    return locationMatch ? locationMatch[1] : "Unknown location";
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Shift History</CardTitle>
          <CardDescription>
            Recent shifts and related cleanings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Shift History</CardTitle>
        <CardDescription>
          Recent shifts and related cleanings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {shiftsHistory.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No shift history available
          </div>
        ) : (
          <div className="space-y-4">
            {shiftsHistory.map((shift) => (
              <div key={shift.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleShift(shift.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">{shift.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatStartTime(shift)} - {formatEndTime(shift)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-2 text-primary" />
                      <span>{shift.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <ClipboardCheck className="h-4 w-4 mr-2 text-primary" />
                      <span>Cleanings: {shift.cleanings}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs 
                      ${shift.status === 'finished with scan' ? 'bg-green-100 text-green-800' : 
                        shift.status === 'finished without scan' ? 'bg-yellow-100 text-yellow-800' : 
                        shift.status === 'finished automatically' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {shift.status}
                    </div>
                  </div>
                </div>
                
                {expandedShift === shift.id && (
                  <div className="p-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Cleanings during this shift</h4>
                    
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : cleaningsData[shift.id]?.cleanings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No cleanings recorded for this shift</p>
                    ) : (
                      <div className="space-y-3">
                        {cleaningsData[shift.id]?.cleanings.map((cleaning: any) => (
                          <div key={cleaning.id} className="bg-card p-3 rounded-md border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{cleaning.qr_codes?.area_name || getLocationFromNotes(cleaning.notes)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(cleaning.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                  {cleaning.end_time && ` - ${new Date(cleaning.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                                </p>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs 
                                ${cleaning.status === 'finished with scan' ? 'bg-green-100 text-green-800' : 
                                  cleaning.status === 'finished without scan' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'}`}
                              >
                                {cleaning.status}
                              </div>
                            </div>
                            {cleaning.images && cleaning.images.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Images ({cleaning.images.length})</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {cleaning.images.map((img: any) => (
                                    <a 
                                      key={img.id} 
                                      href={img.image_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex-shrink-0"
                                    >
                                      <img 
                                        src={img.image_url} 
                                        alt="Cleaning" 
                                        className="h-16 w-16 object-cover rounded border"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {cleaning.notes && (
                              <div className="mt-2 text-xs">
                                <p className="font-medium">Notes:</p>
                                <p className="text-muted-foreground">{cleaning.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftHistoryCard;
