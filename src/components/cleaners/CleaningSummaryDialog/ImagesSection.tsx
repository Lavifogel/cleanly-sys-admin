
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface ImagesSectionProps {
  images: string[];
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => void;
  maxImages: number;
  isUploading?: boolean;
}

const ImagesSection = ({ 
  images, 
  onAddImage, 
  onRemoveImage, 
  maxImages,
  isUploading = false
}: ImagesSectionProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCameraClick = () => {
    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    // Check if camera is already in use
    const videoElements = document.querySelectorAll('video');
    let cameraInUse = false;
    
    videoElements.forEach(video => {
      if (video.srcObject) {
        cameraInUse = true;
        toast({
          title: "Camera in use",
          description: "Please close the QR scanner before taking photos.",
          variant: "destructive",
        });
      }
    });
    
    if (!cameraInUse) {
      // Reset the file input to ensure it triggers properly
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        // Directly trigger a click on the file input
        fileInputRef.current.click();
      }
    }
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await onAddImage(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      stopAllVideoStreams();
    }
  };

  // Clean up any video streams when component unmounts
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Photos (Optional)</label>
        <span className="text-xs text-muted-foreground">{images.length}/{maxImages}</span>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((img, index) => (
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
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        disabled={images.length >= maxImages || isUploading}
        onClick={handleCameraClick}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </>
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
    </div>
  );
};

export default ImagesSection;
