
import { 
  CalendarIcon, 
  Clock, 
  Image, 
  MapPin, 
  TimerIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CleaningHistoryItem } from "@/types/cleaning";
import { useEffect, useState } from "react";
import { formatTime } from "@/utils/timeUtils";

interface CleaningItemProps {
  cleaning: CleaningHistoryItem & { 
    isActive?: boolean;
    elapsedTime?: number;
  };
  onImageSelect: (url: string) => void;
}

const CleaningItem = ({ cleaning, onImageSelect }: CleaningItemProps) => {
  const [timeDisplay, setTimeDisplay] = useState<string>(
    cleaning.isActive ? formatTime(cleaning.elapsedTime || 0) : cleaning.duration
  );

  // For active cleanings, update the timer display
  useEffect(() => {
    if (cleaning.isActive && cleaning.elapsedTime !== undefined) {
      setTimeDisplay(formatTime(cleaning.elapsedTime));
    }
  }, [cleaning.isActive, cleaning.elapsedTime]);

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-primary mr-1" />
          <h3 className="font-medium">{cleaning.location}</h3>
        </div>
        {cleaning.status === "open" ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TimerIcon className="h-3 w-3 mr-1" />
            ACTIVE
          </Badge>
        ) : cleaning.status === "finished with scan" ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            COMPLETE
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            MANUAL
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
        <div className="flex items-center">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>{cleaning.date}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{cleaning.startTime} - {cleaning.endTime}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          {cleaning.isActive ? (
            <div className="flex items-center text-primary font-medium">
              <TimerIcon className="h-4 w-4 mr-1" />
              {timeDisplay}
            </div>
          ) : (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{cleaning.duration}</span>
            </div>
          )}
        </div>
        
        {cleaning.images > 0 && cleaning.imageUrls && cleaning.imageUrls.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8" 
            onClick={() => onImageSelect(cleaning.imageUrls![0])}
          >
            <Image className="h-4 w-4 mr-1" />
            <span>{cleaning.images} {cleaning.images === 1 ? 'image' : 'images'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CleaningItem;
