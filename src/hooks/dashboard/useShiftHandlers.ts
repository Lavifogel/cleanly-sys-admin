
import { useCallback } from "react";
import { useShift } from "@/hooks/useShift";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useShiftHandlers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    autoEndShift
  } = useShift();
  
  // Shift handlers
  const handleStartShift = (qrData: string) => {
    return startShift(qrData);
  };
  
  const handleEndShiftWithoutScan = () => {
    if (!activeShift) {
      toast({
        title: "Error",
        description: "No active shift to end.",
        variant: "destructive",
      });
      return;
    }
    
    return endShift(false);
  };
  
  return {
    // State
    activeShift,
    elapsedTime,
    shiftsHistory,
    
    // Actions
    handleStartShift,
    handleEndShiftWithoutScan,
    endShift,
    autoEndShift
  };
}
