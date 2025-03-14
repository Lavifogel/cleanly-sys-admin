
import { formatDateToDDMMYYYY } from "@/utils/timeUtils";
import { CleaningHistoryItem } from "@/types/cleaning";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, Clock } from "lucide-react";

interface CleaningItemProps {
  cleaning: CleaningHistoryItem;
  onImageSelect?: (imageUrl: string) => void;
  onClick?: () => void; // Add onClick handler prop
}

const CleaningItem = ({ cleaning, onImageSelect, onClick }: CleaningItemProps) => {
  // Generate badge color based on status
  const getBadgeVariant = (status: string) => {
    if (status === "open" || status === "active") return "default";
    if (status.includes("scan")) return "secondary"; // Changed from "success" to "secondary"
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
      className={`p-4 rounded-lg border ${cleaning.isActive ? 'bg-muted/50 border-primary/20 cursor-pointer' : 'bg-card'}`}
      onClick={onClick} // Add onClick handler to the entire item
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-base">{cleaning.location}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <Badge variant={getBadgeVariant(cleaning.status)}>
          {cleaning.isActive ? "In Progress" : cleaning.status}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center text-sm text-muted-foreground space-x-3">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>
              {cleaning.isActive 
                ? cleaning.duration 
                : `${cleaning.startTime} - ${cleaning.endTime} (${cleaning.duration})`}
            </span>
          </div>
        </div>
        
        {cleaning.images > 0 && cleaning.imageUrls && cleaning.imageUrls.length > 0 && (
          <div className="flex items-center space-x-1">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {cleaning.imageUrls.slice(0, 3).map((url, index) => (
                <div 
                  key={index}
                  className="h-6 w-6 rounded-full border border-background overflow-hidden"
                  onClick={(e) => handleThumbnailClick(e, url)}
                >
                  <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {cleaning.notes && (
        <div className="mt-3 text-sm text-muted-foreground border-t pt-2">
          "{cleaning.notes.length > 100 ? `${cleaning.notes.substring(0, 100)}...` : cleaning.notes}"
        </div>
      )}
    </div>
  );
};

export default CleaningItem;
