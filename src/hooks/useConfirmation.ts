
import { useState } from "react";

export interface ConfirmationDialogData {
  title: string;
  description: string;
  action: () => void;
}

export function useConfirmation() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmationDialogData | null>(null);
  
  const showConfirmationDialog = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setConfirmAction({ title, description, action });
    setShowConfirmDialog(true);
  };

  return {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    showConfirmationDialog
  };
}
