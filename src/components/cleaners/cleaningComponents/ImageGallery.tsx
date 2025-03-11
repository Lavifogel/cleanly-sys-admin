
import { ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageGalleryProps {
  imageUrls?: string[];
  imageCount: number;
  onImageSelect: (imageUrl: string) => void;
}

const ImageGallery = ({ imageUrls, imageCount, onImageSelect }: ImageGalleryProps) => {
  if (imageUrls && imageUrls.length > 0) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {imageUrls.map((imageUrl, index) => (
          <Avatar 
            key={index} 
            className="h-16 w-16 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageSelect(imageUrl)}
          >
            <AvatarImage 
              src={imageUrl} 
              alt={`Cleaning image ${index + 1}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-md bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  } else if (imageCount > 0) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.from({ length: imageCount }).map((_, index) => (
          <Avatar key={index} className="h-16 w-16 rounded-md">
            <AvatarFallback className="rounded-md bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  }
  
  return null;
};

export default ImageGallery;
