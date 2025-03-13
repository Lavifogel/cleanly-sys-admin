
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface UseCleaningImagesProps {
  maxImages?: number;
}

export function useCleaningImages({ maxImages = 5 }: UseCleaningImagesProps = {}) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  // Function to upload image to Supabase storage
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `cleanings/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('cleaning-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
  
  // Function to add an image
  const addImage = async (file: File) => {
    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a temporary local URL for immediate display
      const tempUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, tempUrl]);
      
      // Upload to Supabase
      const publicUrl = await uploadImageToStorage(file);
      
      if (!publicUrl) {
        throw new Error("Failed to upload image");
      }
      
      // Replace the temp URL with the public URL
      setImages(prev => {
        const index = prev.indexOf(tempUrl);
        if (index !== -1) {
          const newImages = [...prev];
          newImages[index] = publicUrl;
          return newImages;
        }
        return prev;
      });
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error handling image:", error);
      // Remove the temporary URL if upload failed
      setImages(prev => prev.filter(url => !url.startsWith('blob:')));
      
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to remove an image
  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // If it's a Supabase URL, extract the path and delete from storage
    if (imageUrl && imageUrl.includes('cleaning-images')) {
      try {
        // Extract the file path from the URL
        const filePath = imageUrl.split('cleaning-images/')[1];
        
        if (filePath) {
          await supabase.storage
            .from('cleaning-images')
            .remove([`cleanings/${filePath}`]);
        }
      } catch (error) {
        console.error("Error removing image from storage:", error);
      }
    }
    
    // Remove from local state
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };
  
  // Function to save image URLs to database
  const saveImagesToDatabase = async (cleaningId: string) => {
    try {
      // Filter out any temporary blob URLs
      const permanentImages = images.filter(url => !url.startsWith('blob:'));
      
      // Save each image URL to the database
      for (const imageUrl of permanentImages) {
        const { error } = await supabase
          .from('images')
          .insert({
            cleaning_id: cleaningId,
            image_url: imageUrl
          } as any);
        
        if (error) {
          console.error("Error saving image to database:", error);
        }
      }
      
      return permanentImages;
    } catch (error) {
      console.error("Error saving images:", error);
      return [];
    }
  };
  
  return {
    images,
    isUploading,
    addImage,
    removeImage,
    saveImagesToDatabase
  };
}
