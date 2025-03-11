
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CleaningSummary } from "@/types/cleaning";
import { useToast } from "@/hooks/use-toast";

export function useCleaningImages(
  cleaningSummary: CleaningSummary,
  setCleaningSummary: (summary: CleaningSummary) => void
) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const addImage = async (file: File) => {
    if (cleaningSummary.images.length >= 3) {
      toast({
        title: "Maximum number of images reached",
        description: "You can only upload up to 3 images per cleaning.",
        variant: "destructive",
      });
      throw new Error("Maximum number of images reached");
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log("Uploading file:", fileName, "to bucket: cleaning-images");
      
      // Create a new File object to ensure consistency
      const fileToUpload = new File([file], fileName, { type: file.type });
      
      const { data, error } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Upload error details:", error);
        toast({
          title: "Image upload failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Upload successful:", data);
      
      const { data: { publicUrl } } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName);
      
      console.log("Generated public URL:", publicUrl);
      
      setCleaningSummary({
        ...cleaningSummary,
        images: [...cleaningSummary.images, publicUrl]
      });
      
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
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...cleaningSummary.images];
    const imageToRemove = newImages[index];
    
    // Extract the filename from the URL
    const filePath = imageToRemove.split('/').pop();
    
    if (filePath) {
      console.log("Removing file:", filePath);
      
      supabase.storage
        .from('cleaning-images')
        .remove([filePath])
        .then(({ error }) => {
          if (error) {
            console.error("Error deleting image:", error);
            toast({
              title: "Error removing image",
              description: error.message,
              variant: "destructive",
            });
          } else {
            console.log("File deleted successfully");
            toast({
              title: "Image removed",
              description: "The image has been successfully removed.",
            });
          }
        });
    }
    
    newImages.splice(index, 1);
    setCleaningSummary({
      ...cleaningSummary,
      images: newImages
    });
  };

  return {
    addImage,
    removeImage,
    isUploading
  };
}
