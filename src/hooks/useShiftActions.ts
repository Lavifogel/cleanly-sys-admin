
import { useToast } from "@/hooks/use-toast";
import { Cleaning } from "@/types/cleaning";

export function useShiftActions() {
  const { toast } = useToast();

  const handleStartShift = (
    hasActiveShift: boolean,
    onOpenScanner: (purpose: "startShift") => void
  ) => {
    if (hasActiveShift) {
      toast({
        title: "Shift Already Active",
        description: "You already have an active shift.",
        variant: "destructive",
      });
      return;
    }
    
    onOpenScanner("startShift");
  };

  const handleEndShift = (
    hasActiveShift: boolean,
    hasActiveCleaning: boolean,
    withScan: boolean,
    onOpenScanner: (purpose: "endShift") => void,
    showConfirmationDialog: (title: string, description: string, action: () => void) => void,
    endShiftAction: (withScan: boolean) => void
  ) => {
    if (!hasActiveShift) {
      toast({
        title: "No Active Shift",
        description: "You don't have an active shift to end.",
        variant: "destructive",
      });
      return;
    }

    if (hasActiveCleaning) {
      toast({
        title: "Active Cleaning Detected",
        description: "Please finish your current cleaning before ending your shift.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Shift Without Scan",
        "Are you sure you want to end your shift without scanning? This action cannot be undone.",
        () => endShiftAction(withScan)
      );
    } else {
      onOpenScanner("endShift");
    }
  };

  return {
    handleStartShift,
    handleEndShift,
  };
}
