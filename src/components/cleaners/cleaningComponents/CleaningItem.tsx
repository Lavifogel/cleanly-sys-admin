
import { MapPin, Calendar, Clock, Timer, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CleaningHistoryItem } from "@/types/cleaning";
import ImageGallery from "./ImageGallery";

interface CleaningItemProps {
  cleaning: CleaningHistoryItem;
  onImageSelect: (imageUrl: string) => void;
}

const CleaningItem = ({ cleaning, onImageSelect }: CleaningItemProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <h4 className="font-medium">{cleaning.location}</h4>
            {cleaning.status === "open" ? (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-50">
                OPEN
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-500 border-red-200 hover:bg-red-50">
                COMPLETE
              </Badge>
            )}
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <p>{cleaning.date}</p>
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <p>{cleaning.startTime} - {cleaning.endTime}</p>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded">
          <Timer className="h-3 w-3 mr-1 text-primary" />
          {cleaning.duration}
        </div>
      </div>
      {cleaning.notes && (
        <div className="flex items-center text-sm">
          <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
          <p className="text-sm">{cleaning.notes}</p>
        </div>
      )}
      <ImageGallery 
        imageUrls={cleaning.imageUrls} 
        imageCount={cleaning.images} 
        onImageSelect={onImageSelect} 
      />
    </div>
  );
};

export default CleaningItem;
