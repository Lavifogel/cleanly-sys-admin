
import { formatDateToDDMMYYYY } from "@/utils/timeUtils";
import { CleaningHistoryItem } from "@/types/cleaning";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, Clock, Timer } from "lucide-react";

interface CleaningItemProps {
  cleaning: CleaningHistoryItem;
  onImageSelect?: (imageUrl: string) => void;
  onClick?: () => void;
}

const CleaningItem = ({ cleaning, onImageSelect, onClick }: CleaningItemProps) => {
  // Generate badge color based on status
  const getBadgeVariant = (status: string) => {
    if (status === "open" || status === "active") return "default";
    if (status.includes("scan")) return "secondary";
    return "secondary";
  };

  // Format date if needed
  const formattedDate = cleaning.date.includes('/') 
    ? cleaning.date 
    : formatDateToDDMMYYYY(new Date(cleaning.date));

  // Handle thumbnail click to show full image
  const handleThumbnailClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Stop event from bubbling up
    if (onImageSelect) {
      onImageSelect(url);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border shadow-sm transition-all hover:shadow-md ${cleaning.isActive ? 'bg-primary/5 border-primary/20 cursor-pointer' : 'bg-card hover:bg-muted/10'}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base">{cleaning.location}</h3>
          <Badge variant={getBadgeVariant(cleaning.status)} className="font-normal text-xs px-2.5 py-0.5">
            {cleaning.isActive ? "In Progress" : cleaning.status}
          </Badge>
        </div>
        
        <div className="grid gap-1.5 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Date: {formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span>
              Started at: {cleaning.startTime} 
              {!cleaning.isActive && ` - ${cleaning.endTime}`}
            </span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Timer className="h-3.5 w-3.5 mr-1.5" />
            <span>Duration: {cleaning.duration}</span>
          </div>
        </div>
      </div>
      
      {cleaning.images > 0 && cleaning.imageUrls && cleaning.imageUrls.length > 0 && (
        <div className="flex justify-end items-center mt-3">
          <div className="flex items-center space-x-1.5">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {cleaning.imageUrls.slice(0, 3).map((url, index) => (
                <div 
                  key={index}
                  className="h-7 w-7 rounded-full ring-2 ring-background overflow-hidden transition-transform hover:scale-110"
                  onClick={(e) => handleThumbnailClick(e, url)}
                >
                  <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            {cleaning.imageUrls.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{cleaning.imageUrls.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
      
      {cleaning.notes && (
        <div className="mt-3 text-sm text-muted-foreground border-t border-border/50 pt-2">
          <p className="line-clamp-2 italic">
            "{cleaning.notes.length > 100 ? `${cleaning.notes.substring(0, 100)}...` : cleaning.notes}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CleaningItem;
