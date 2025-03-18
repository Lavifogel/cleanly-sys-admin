
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CleaningSummary } from "@/types/cleaning";
import CleaningDetails from "./CleaningSummaryDialog/CleaningDetails";
import NotesSection from "./CleaningSummaryDialog/NotesSection";
import ImagesSection from "./CleaningSummaryDialog/ImagesSection";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CleaningSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleaningSummary: CleaningSummary;
  summaryNotes: string;
  onSummaryNotesChange: (notes: string) => void;
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onCompleteSummary: () => void;
  isUploading?: boolean;
  images: string[];
}

const CleaningSummaryDialog = ({
  open,
  onOpenChange,
  cleaningSummary,
  summaryNotes,
  onSummaryNotesChange,
  onAddImage,
  onRemoveImage,
  onCompleteSummary,
  isUploading = false,
  images = [],
}: CleaningSummaryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCompleteCleaning = async () => {
    try {
      setIsSubmitting(true);
      await onCompleteSummary();
      toast({
        title: "Cleaning completed",
        description: "Your cleaning has been recorded successfully",
      });
    } catch (error) {
      console.error("Error completing cleaning:", error);
      toast({
        title: "Error",
        description: "Failed to complete cleaning. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cleaning Summary</DialogTitle>
          <DialogDescription>
            Take photos and add notes to complete your cleaning record
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <CleaningDetails cleaningSummary={cleaningSummary} />
          
          <ImagesSection 
            images={images}
            onAddImage={onAddImage}
            onRemoveImage={onRemoveImage}
            maxImages={3}
            isUploading={isUploading}
          />

          <NotesSection 
            summaryNotes={summaryNotes}
            onSummaryNotesChange={onSummaryNotesChange}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleCompleteCleaning} 
            className="w-full"
            disabled={isUploading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                Complete Cleaning
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleaningSummaryDialog;
