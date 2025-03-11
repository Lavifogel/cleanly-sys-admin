
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Cleaning {
  location: string;
  startTime: Date;
  timer: number;
  paused: boolean;
}

export interface CleaningHistoryItem {
  id: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  images: number;
  notes: string;
  shiftId?: string;
}

export interface CleaningSummary {
  location: string;
  startTime: string;
  endTime: string;
  duration: string;
  notes: string;
  images: string[];
}

export function useCleaning(activeShiftId: string | undefined) {
  const { toast } = useToast();
  const [activeCleaning, setActiveCleaning] = useState<null | Cleaning>(null);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
  const [cleaningSummary, setCleaningSummary] = useState<CleaningSummary>({
    location: "",
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
    images: []
  });
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [cleaningsHistory, setCleaningsHistory] = useState<CleaningHistoryItem[]>([
    {
      id: "1",
      location: "Conference Room A",
      date: "2023-08-15",
      startTime: "09:30",
      endTime: "10:05",
      duration: "35m",
      status: "finished with scan",
      images: 2,
      notes: "Cleaned and restocked supplies",
      shiftId: "previous-shift-1",
    },
    {
      id: "2",
      location: "Main Office",
      date: "2023-08-15",
      startTime: "10:30",
      endTime: "11:12",
      duration: "42m",
      status: "finished without scan",
      images: 0,
      notes: "",
      shiftId: "previous-shift-1",
    },
  ]);

  // Start cleaning
  const startCleaning = (qrData: string) => {
    const locationFromQR = qrData.includes("location=") 
      ? qrData.split("location=")[1].split("&")[0] 
      : "Conference Room B";

    toast({
      title: "Cleaning Started",
      description: "Your cleaning task has been started after scanning the QR code.",
    });

    setActiveCleaning({
      location: locationFromQR,
      startTime: new Date(),
      timer: 0,
      paused: false,
    });
    setCleaningElapsedTime(0);
  };

  // Toggle pause/resume cleaning
  const togglePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });

    toast({
      title: activeCleaning.paused ? "Cleaning Resumed" : "Cleaning Paused",
      description: activeCleaning.paused ? "You have resumed the cleaning." : "You have paused the cleaning.",
    });
  };

  // Prepare cleaning summary
  const prepareSummary = (withScan: boolean, qrData?: string) => {
    if (!activeCleaning) return;
    
    setCleaningSummary({
      location: activeCleaning.location,
      startTime: activeCleaning.startTime.toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: formatTime(cleaningElapsedTime),
      notes: "",
      images: []
    });
    
    setSummaryNotes("");
    setShowSummary(true);
  };

  // Complete cleaning with summary
  const completeSummary = () => {
    if (!activeCleaning) return;
    
    const newCleaning = {
      id: (cleaningsHistory.length + 1).toString(),
      location: activeCleaning.location,
      date: new Date().toISOString().split('T')[0],
      startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
      status: "finished with scan",
      images: cleaningSummary.images.length,
      notes: summaryNotes,
      shiftId: activeShiftId,
    };

    setCleaningsHistory([newCleaning, ...cleaningsHistory]);
    setActiveCleaning(null);
    setCleaningElapsedTime(0);
    setShowSummary(false);
    
    toast({
      title: "Cleaning Completed",
      description: "Your cleaning summary has been saved.",
    });
    
    return true;
  };

  // Handle image upload
  const addImage = async (file: File) => {
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
      setCleaningSummary(prev => ({
        ...prev,
        images: [...prev.images, publicUrl]
      }));
      
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

  // Timer effect for tracking cleaning time
  useEffect(() => {
    let interval: number | null = null;
    
    if (activeCleaning && !activeCleaning.paused && !interval) {
      interval = window.setInterval(() => {
        setCleaningElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCleaning]);

  // Helper for formatting time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary
  };
}
