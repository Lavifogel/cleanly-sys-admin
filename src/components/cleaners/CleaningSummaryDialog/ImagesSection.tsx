
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImagesSectionProps {
  images: string[];
  onAddImage: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => void;
}

const ImagesSection = ({ images, onAddImage, onRemoveImage }: ImagesSectionProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setIsUploading(true);
    console.log("Selected file:", file.name, "type:", file.type, "size:", file.size);
    
    try {
      await onAddImage(file);
      toast({
        title: "Image Uploaded",
        description: "Your image has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Images (Optional)</label>
        <span className="text-xs text-muted-foreground">{images.length}/5</span>
      </div>
      
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
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
      ) : (
        <div className="text-center py-4 border rounded-md text-sm text-muted-foreground">
          No images added
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        disabled={images.length >= 5 || isUploading}
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
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImagesSection;
