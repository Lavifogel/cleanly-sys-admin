
import { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CleaningSummary } from "@/types/cleaning";
import CleaningDetails from "./CleaningSummaryDialog/CleaningDetails";
import NotesSection from "./CleaningSummaryDialog/NotesSection";
import ImagesSection from "./CleaningSummaryDialog/ImagesSection";
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
}: CleaningSummaryDialogProps) => {
  const { toast } = useToast();

  const handleCompleteSummary = () => {
    if (cleaningSummary.images.length === 0) {
      toast({
        title: "No images added",
        description: "Please add at least one image before completing the cleaning summary.",
        variant: "destructive",
      });
      return;
    }
    onCompleteSummary();
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
            images={cleaningSummary.images}
            onAddImage={onAddImage}
            onRemoveImage={onRemoveImage}
            maxImages={3}
          />

          <NotesSection 
            summaryNotes={summaryNotes}
            onSummaryNotesChange={onSummaryNotesChange}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleCompleteSummary} 
            className="w-full"
          >
            Complete Cleaning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleaningSummaryDialog;
