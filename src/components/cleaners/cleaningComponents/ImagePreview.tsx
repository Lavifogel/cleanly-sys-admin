
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  selectedImage: string | null;
  onClose: () => void;
}

const ImagePreview = ({ selectedImage, onClose }: ImagePreviewProps) => {
  return (
    <Dialog open={!!selectedImage} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none">
        <div className="relative w-full h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <img 
            src={selectedImage || ''} 
            alt="Enlarged view" 
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
