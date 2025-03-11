
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImagesSectionProps {
  images: string[];
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => void;
  maxImages: number;
}

const ImagesSection = ({ images, onAddImage, onRemoveImage, maxImages }: ImagesSectionProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    try {
      await onAddImage(file);
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Photos (Required)</label>
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
        onClick={() => document.getElementById('photo-input')?.click()}
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
        id="photo-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        onClick={(e) => {
          // Reset the input value to allow selecting the same file again
          (e.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );
};

export default ImagesSection;
