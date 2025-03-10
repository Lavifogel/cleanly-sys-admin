
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Timer, Camera, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CleaningSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleaningSummary: {
    location: string;
    startTime: string;
    endTime: string;
    duration: string;
    notes: string;
    images: string[];
  };
  summaryNotes: string;
  onSummaryNotesChange: (notes: string) => void;
  onAddImage: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImage = () => {
    if (cleaningSummary.images.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can only add up to 5 images per cleaning.",
        variant: "destructive",
      });
      return;
    }
    
    // This will direct to camera on mobile devices
    onAddImage();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cleaning Summary</DialogTitle>
          <DialogDescription>
            Complete your cleaning record
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <h4 className="font-medium">{cleaningSummary.location}</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Start:
              </div>
              <div>{cleaningSummary.startTime}</div>
              
              <div className="text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                End:
              </div>
              <div>{cleaningSummary.endTime}</div>
              
              <div className="text-muted-foreground flex items-center">
                <Timer className="h-3 w-3 mr-1" />
                Duration:
              </div>
              <div>{cleaningSummary.duration}</div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Add Notes (Optional)</label>
            <Textarea 
              placeholder="Enter any notes about the cleaning" 
              value={summaryNotes}
              onChange={(e) => onSummaryNotesChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Images (Optional)</label>
              <span className="text-xs text-muted-foreground">{cleaningSummary.images.length}/5</span>
            </div>
            
            {cleaningSummary.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {cleaningSummary.images.map((img, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-md flex items-center justify-center relative">
                    <Avatar className="w-full h-full rounded-md">
                      <AvatarImage src={img} alt={`Cleaning image ${index + 1}`} className="object-cover" />
                      <AvatarFallback className="rounded-md">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-5 w-5 rounded-full"
                      onClick={() => onRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md text-sm text-muted-foreground">
                No images added
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleAddImage}
              disabled={cleaningSummary.images.length >= 5}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={onCompleteSummary} className="w-full">
            Complete Cleaning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CleaningSummaryDialog;
