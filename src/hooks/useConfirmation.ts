
import { useState } from "react";

export type ConfirmationAction = () => void;

export function useConfirmation() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmationAction | null>(null);
  
  const showConfirmationDialog = (
    title: string,
    description: string,
    action: ConfirmationAction
  ) => {
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  return {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    showConfirmationDialog
  };
}
