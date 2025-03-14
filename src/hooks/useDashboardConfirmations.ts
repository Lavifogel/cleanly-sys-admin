
import { useState } from "react";
import { ConfirmationDialogData } from "@/hooks/useConfirmation";

export function useDashboardConfirmations() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmationDialogData>({
    title: "",
    description: "",
    action: () => {}
  });

  // Handle end shift without scanning QR code
  const handleConfirmEndShiftWithoutQR = (onConfirm: () => void) => {
    setConfirmAction({
      title: "End Shift Without QR Code",
      description: "Are you sure you want to end your shift without scanning the QR code?",
      action: onConfirm
    });
    setShowConfirmDialog(true);
  };

  // Handle end cleaning without scanning QR code
  const handleConfirmEndCleaningWithoutQR = (onConfirm: () => void) => {
    setConfirmAction({
      title: "End Cleaning Without QR Code",
      description: "Are you sure you want to end this cleaning session without scanning the QR code?",
      action: onConfirm
    });
    setShowConfirmDialog(true);
  };

  // For general confirmation purposes
  const handleEndShiftWithoutScan = () => {
    // This would be implemented by the consumer of this hook
  };

  const handleEndCleaningWithoutScan = () => {
    // This would be implemented by the consumer of this hook
  };

  return {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleConfirmEndShiftWithoutQR,
    handleConfirmEndCleaningWithoutQR,
    handleEndShiftWithoutScan,
    handleEndCleaningWithoutScan
  };
}
