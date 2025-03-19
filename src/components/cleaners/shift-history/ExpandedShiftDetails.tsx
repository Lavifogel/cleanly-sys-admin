
import { FC } from "react";
import { Loader2 } from "lucide-react";
import CleaningItem from "./CleaningItem";

interface CleaningData {
  id: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
  qr_codes?: {
    area_name: string | null;
  } | null;
  images?: {
    id: string;
    image_url: string;
  }[];
}

interface ExpandedShiftDetailsProps {
  loading: boolean;
  cleanings: CleaningData[];
  getLocationFromNotes: (notes: string) => string;
}

const ExpandedShiftDetails: FC<ExpandedShiftDetailsProps> = ({ 
  loading, 
  cleanings, 
  getLocationFromNotes
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (cleanings.length === 0) {
    return <p className="text-sm text-muted-foreground">No cleanings recorded for this shift</p>;
  }

  return (
    <div className="space-y-3">
      {cleanings.map((cleaning) => (
        <CleaningItem 
          key={cleaning.id} 
          cleaning={cleaning} 
          getLocationFromNotes={getLocationFromNotes} 
        />
      ))}
    </div>
  );
};

export default ExpandedShiftDetails;
