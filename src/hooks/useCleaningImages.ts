
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CleaningSummary } from "@/types/cleaning";

export function useCleaningImages() {
  const { toast } = useToast();

  // Handle image upload
  const addImage = async (file: File, cleaningSummary: CleaningSummary, setCleaningSummary: (summary: CleaningSummary) => void) => {
    if (cleaningSummary.images.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can only add up to 5 images per cleaning.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Starting file upload to Supabase");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, file);
      
      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }
      
      console.log("File uploaded successfully:", data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName);
      
      console.log("Uploaded image URL:", publicUrl);
      
      // Update the cleaning summary with the new image URL
      setCleaningSummary({
        ...cleaningSummary,
        images: [...cleaningSummary.images, publicUrl]
      });
      
      toast({
        title: "Image Added",
        description: "Your image has been added to the cleaning summary.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle image removal
  const removeImage = (index: number, cleaningSummary: CleaningSummary, setCleaningSummary: (summary: CleaningSummary) => void) => {
    const newImages = [...cleaningSummary.images];
    
    const imageToRemove = newImages[index];
    
    const filePath = imageToRemove.split('/').pop();
    
    if (filePath) {
      console.log("Removing file:", filePath);
      supabase.storage
        .from('cleaning-images')
        .remove([filePath])
        .then(({ error }) => {
          if (error) {
            console.error("Error deleting image:", error);
          }
        });
    }
    
    newImages.splice(index, 1);
    
    setCleaningSummary({
      ...cleaningSummary,
      images: newImages
    });
    
    toast({
      title: "Image Removed",
      description: "The image has been removed from the cleaning summary.",
    });
  };

  return {
    addImage,
    removeImage
  };
}
