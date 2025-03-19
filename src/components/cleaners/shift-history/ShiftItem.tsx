
import { FC } from "react";
import { Calendar, Clock, ClipboardCheck, Timer } from "lucide-react";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import ExpandedShiftDetails from "./ExpandedShiftDetails";

interface ShiftItemProps {
  shift: ShiftHistoryItem;
  isExpanded: boolean;
  loading: boolean;
  cleanings: any[];
  formatStartTime: (shift: ShiftHistoryItem) => string;
  formatEndTime: (shift: ShiftHistoryItem) => string;
  getLocationFromNotes: (notes: string) => string;
  onToggle: () => void;
}

const ShiftItem: FC<ShiftItemProps> = ({ 
  shift, 
  isExpanded, 
  loading, 
  cleanings, 
  formatStartTime, 
  formatEndTime, 
  getLocationFromNotes, 
  onToggle 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
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
      
      {isExpanded && (
        <div className="p-4 border-t">
          <h4 className="text-sm font-medium mb-2">Cleanings during this shift</h4>
          <ExpandedShiftDetails 
            loading={loading} 
            cleanings={cleanings}
            getLocationFromNotes={getLocationFromNotes}
          />
        </div>
      )}
    </div>
  );
};

export default ShiftItem;
