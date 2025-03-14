
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Timer, MapPin, Image, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CleaningHistoryItem } from "@/types/cleaning";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ImagePreview from "./cleaningComponents/ImagePreview";

interface CleaningHistoryCardProps {
  cleaningsHistory: CleaningHistoryItem[];
  currentShiftId?: string;
}

const CleaningHistoryCard = ({ cleaningsHistory, currentShiftId }: CleaningHistoryCardProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filter cleanings to only show those from the current shift if a shift ID is provided
  const filteredCleanings = currentShiftId 
    ? cleaningsHistory.filter(cleaning => cleaning.shiftId === currentShiftId)
    : cleaningsHistory;
  
  // Function to format date string to DD/MM/YYYY
  function formatDateToDDMMYYYY(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cleaning History</CardTitle>
          <CardDescription>
            {currentShiftId 
              ? "Cleanings completed in your current shift" 
              : "View your recent cleanings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCleanings.length > 0 ? (
              filteredCleanings.map((cleaning) => (
                <div 
                  key={cleaning.id} 
                  className="border rounded-lg overflow-hidden p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <h4 className="font-medium">{cleaning.location}</h4>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <p className="mr-3">{formatDateToDDMMYYYY(cleaning.date)}</p>
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <p>{cleaning.startTime} - {cleaning.endTime}</p>
                      </div>
                      
                      {cleaning.notes && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-sm">
                                <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <p className="line-clamp-1 text-muted-foreground">
                                  {cleaning.notes}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{cleaning.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {cleaning.imageUrls && cleaning.imageUrls.length > 0 && (
                        <div className="flex items-center mt-2">
                          <div className="flex -space-x-2">
                            {cleaning.imageUrls.slice(0, 3).map((url, index) => (
                              <img 
                                key={index}
                                src={url} 
                                alt={`Cleaning image ${index + 1}`}
                                className="h-8 w-8 rounded-md object-cover border border-border cursor-pointer"
                                onClick={() => setSelectedImage(url)}
                              />
                            ))}
                          </div>
                          {cleaning.imageUrls.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{cleaning.imageUrls.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded-full">
                      <Timer className="h-3 w-3 mr-1 text-primary" />
                      {cleaning.duration}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {currentShiftId 
                  ? "No cleanings completed in this shift yet" 
                  : "No cleaning history available"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <ImagePreview 
        selectedImage={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  );
};

export default CleaningHistoryCard;
