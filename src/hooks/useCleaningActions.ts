
import { useToast } from "@/hooks/use-toast";
import { Cleaning } from "@/types/cleaning";

export function useCleaningActions() {
  const { toast } = useToast();

  const handleEndCleaning = (
    activeCleaning: Cleaning | null,
    withScan: boolean,
    onOpenScanner: (purpose: "endCleaning") => void,
    showConfirmationDialog: (title: string, description: string, action: () => void) => void,
    prepareSummaryAction: (withScan: boolean) => void
  ) => {
    if (!activeCleaning) {
      toast({
        title: "No Active Cleaning",
        description: "You don't have an active cleaning to end.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Cleaning Without Scan",
        "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
        () => prepareSummaryAction(withScan)
      );
    } else {
      onOpenScanner("endCleaning");
    }
  };

  return {
    handleEndCleaning,
  };
}
