
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface UseCleaningImagesProps {
  maxImages?: number;
}

export function useCleaningImages({ maxImages = 3 }: UseCleaningImagesProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Add an image to the collection
  const addImage = async (file: File) => {
    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only add up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate a random filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Add to images array
      setImages([...images, urlData.publicUrl]);
      
      toast({
        title: "Image added",
        description: "Your image has been added to the cleaning report.",
      });
    } catch (error: any) {
      console.error("Error in addImage:", error);
      toast({
        title: "Error adding image",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove an image from the collection
  const removeImage = (index: number) => {
    if (index < 0 || index >= images.length) {
      return;
    }
    
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    toast({
      title: "Image removed",
      description: "The image has been removed from your cleaning report.",
    });
  };

  // Reset the images array
  const resetImages = () => {
    setImages([]);
  };

  // Save images to the database for a specific cleaning
  const saveImagesToDatabase = async (cleaningId: string) => {
    if (images.length === 0) {
      return true; // Nothing to save
    }
    
    setIsUploading(true);
    
    try {
      // Save each image reference to the database
      for (const imageUrl of images) {
        const { error } = await supabase
          .from('images')
          .insert({
            cleaning_id: cleaningId,
            activity_log_id: cleaningId,
            image_url: imageUrl
          });
        
        if (error) {
          console.error("Error saving image to database:", error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error saving images to database:", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    images,
    addImage,
    removeImage,
    resetImages,
    isUploading,
    saveImagesToDatabase
  };
}

export default useCleaningImages;
