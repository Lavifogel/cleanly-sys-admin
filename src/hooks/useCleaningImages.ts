
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CleaningSummary } from "@/types/cleaning";

export function useCleaningImages(
  cleaningSummary: CleaningSummary,
  setCleaningSummary: (summary: CleaningSummary) => void
) {
  const addImage = async (file: File) => {
    if (cleaningSummary.images.length >= 3) {
      throw new Error("Maximum number of images reached");
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log("Uploading file:", fileName, "to bucket: cleaning-images");
      
      const fileToUpload = new File([file], fileName, { type: file.type });
      
      const { data, error } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, fileToUpload);
      
      if (error) {
        console.error("Upload error details:", error);
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
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const removeImage = (index: number) => {
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
          } else {
            console.log("File deleted successfully");
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
    removeImage
  };
}
