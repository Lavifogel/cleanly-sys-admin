
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import ShiftItem from "./shift-history/ShiftItem";
import ShiftHistoryLoadingSkeleton from "./shift-history/ShiftHistoryLoadingSkeleton";
import { useShiftHistoryData } from "./shift-history/useShiftHistoryData";

interface ShiftHistoryCardProps {
  shiftsHistory: ShiftHistoryItem[];
  isLoading?: boolean;
}

const ShiftHistoryCard = ({ shiftsHistory, isLoading = false }: ShiftHistoryCardProps) => {
  const {
    expandedShift,
    loading,
    cleaningsData,
    toggleShift,
    formatStartTime,
    formatEndTime,
    getLocationFromNotes
  } = useShiftHistoryData(shiftsHistory);

  if (isLoading) {
    return <ShiftHistoryLoadingSkeleton />;
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
              <ShiftItem 
                key={shift.id}
                shift={shift}
                isExpanded={expandedShift === shift.id}
                loading={loading}
                cleanings={cleaningsData[shift.id]?.cleanings || []}
                formatStartTime={formatStartTime}
                formatEndTime={formatEndTime}
                getLocationFromNotes={getLocationFromNotes}
                onToggle={() => toggleShift(shift.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftHistoryCard;
