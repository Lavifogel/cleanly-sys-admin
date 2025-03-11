
import { Clock, MapPin, Timer } from "lucide-react";
import { CleaningSummary } from "@/types/cleaning";

interface CleaningDetailsProps {
  cleaningSummary: CleaningSummary;
}

const CleaningDetails = ({ cleaningSummary }: CleaningDetailsProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        <h4 className="font-medium">{cleaningSummary.location}</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Start:
        </div>
        <div>{cleaningSummary.startTime}</div>
        
        <div className="text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          End:
        </div>
        <div>{cleaningSummary.endTime}</div>
        
        <div className="text-muted-foreground flex items-center">
          <Timer className="h-3 w-3 mr-1" />
          Duration:
        </div>
        <div>{cleaningSummary.duration}</div>
      </div>
    </div>
  );
};

export default CleaningDetails;
