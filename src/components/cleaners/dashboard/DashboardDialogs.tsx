
import CleaningSummaryDialog from "@/components/cleaners/CleaningSummaryDialog";
import ConfirmationDialog from "@/components/cleaners/ConfirmationDialog";
import { CleaningSummary } from "@/types/cleaning";
import { ConfirmationDialogData } from "@/hooks/useConfirmation";

interface DashboardDialogsProps {
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  cleaningSummary: CleaningSummary;
  summaryNotes: string;
  setSummaryNotes: (notes: string) => void;
  addImage: (file: File) => Promise<void>;
  removeImage: (index: number) => void;
  handleCompleteSummary: () => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  confirmAction: ConfirmationDialogData | null;
  isUploading?: boolean;
  images?: string[];
}

const DashboardDialogs = ({
  showSummary,
  setShowSummary,
  cleaningSummary,
  summaryNotes,
  setSummaryNotes,
  addImage,
  removeImage,
  handleCompleteSummary,
  showConfirmDialog,
  setShowConfirmDialog,
  confirmAction,
  isUploading = false,
  images = [],
}: DashboardDialogsProps) => {
  return (
    <>
      <CleaningSummaryDialog 
        open={showSummary}
        onOpenChange={setShowSummary}
        cleaningSummary={cleaningSummary}
        summaryNotes={summaryNotes}
        onSummaryNotesChange={setSummaryNotes}
        onAddImage={addImage}
        onRemoveImage={removeImage}
        onCompleteSummary={handleCompleteSummary}
        isUploading={isUploading}
        images={images}
      />

      <ConfirmationDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        onConfirm={() => confirmAction?.action && confirmAction.action()}
      />
    </>
  );
};

export default DashboardDialogs;
