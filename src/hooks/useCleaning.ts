
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { useCleaningImages } from "./useCleaningImages";
import { useCleaningSummary } from "./useCleaningSummary";

export { type Cleaning, type CleaningHistoryItem, type CleaningSummary } from "@/types/cleaning";

export function useCleaning(activeShiftId: string | undefined) {
  const { toast } = useToast();
  const [activeCleaning, setActiveCleaning] = useState<null | Cleaning>(null);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
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

  // Use our refactored hooks
  const {
    cleaningSummary,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary,
    prepareSummary: prepSummary,
    completeSummary: compSummary
  } = useCleaningSummary(
    activeCleaning, 
    cleaningElapsedTime, 
    cleaningsHistory, 
    setCleaningsHistory, 
    setActiveCleaning, 
    setCleaningElapsedTime
  );

  const { addImage: addCleaningImage, removeImage: removeCleaningImage } = useCleaningImages();

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

  // Adapter methods for the refactored hooks
  const prepareSummary = (withScan: boolean, qrData?: string) => {
    prepSummary(withScan, qrData);
  };

  const completeSummary = () => {
    return compSummary(activeShiftId);
  };

  const addImage = async (file: File) => {
    await addCleaningImage(file, cleaningSummary, setCleaningSummary);
  };

  const removeImage = (index: number) => {
    removeCleaningImage(index, cleaningSummary, setCleaningSummary);
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
