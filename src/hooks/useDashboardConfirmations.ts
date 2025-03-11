
import { useConfirmation } from "@/hooks/useConfirmation";

export function useDashboardConfirmations(
  activeShift: any,
  activeCleaning: any,
  endShift: (withScan: boolean, qrData?: string) => void,
  prepareSummary: (withScan: boolean, qrData?: string) => void
) {
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    showConfirmationDialog
  } = useConfirmation();
  
  // Handler functions that use confirmation dialogs
  const handleEndShiftWithoutScan = () => {
    if (!activeShift || activeCleaning) return;
    showConfirmationDialog(
      "End Shift Without Scan",
      "Are you sure you want to end your shift without scanning? This action cannot be undone.",
      () => endShift(false)
    );
  };

  const handleEndCleaningWithoutScan = () => {
    if (!activeCleaning) return;
    showConfirmationDialog(
      "End Cleaning Without Scan",
      "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
      () => prepareSummary(false)
    );
  };
  
  return {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleEndShiftWithoutScan,
    handleEndCleaningWithoutScan
  };
}
