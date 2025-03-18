
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, AlertTriangle } from "lucide-react";

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasActiveShift: boolean;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasActiveShift,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasActiveShift ? "Active Shift Detected" : "Confirm Logout"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasActiveShift ? (
              <Alert className="mt-4 border-amber-500 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-700 font-medium">You have an active shift</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Please end your current shift before logging out. Go to the Home tab and use the "End Shift" button.
                </AlertDescription>
              </Alert>
            ) : (
              "Are you sure you want to log out?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!hasActiveShift && (
            <AlertDialogAction onClick={onConfirm}>Logout</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
