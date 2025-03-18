
import { useShift } from "@/hooks/useShift";
import { useToast } from "@/hooks/use-toast";

export function useShiftHandlers() {
  const { toast } = useToast();
  
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    autoEndShift
  } = useShift();

  const handleStartShift = () => {
    // This will be implemented by the QR scanner handlers
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift) {
      toast({
        title: "Error",
        description: "No active shift to end.",
        variant: "destructive",
      });
      return;
    }
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
  };

  const handleAutoEndShift = () => {
    if (!activeShift) return;
    autoEndShift();
  };

  return {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift
  };
}
