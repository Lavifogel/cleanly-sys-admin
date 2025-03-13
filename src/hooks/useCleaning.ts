
import { useState } from "react";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { useCleaningImages } from "./useCleaningImages";
import { useCleaningTimer } from "./useCleaningTimer";
import { formatTime } from "@/utils/timeUtils";

export function useCleaning(activeShiftId: string | undefined) {
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
      imageUrls: [
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage1.jpg",
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage2.jpg"
      ]
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

  const { images, addImage, removeImage, isUploading, saveImagesToDatabase } = useCleaningImages({ maxImages: 5 });
  
  useCleaningTimer(activeCleaning, setCleaningElapsedTime);

  const startCleaning = (qrData: string) => {
    const locationFromQR = qrData.includes("location=") 
      ? qrData.split("location=")[1].split("&")[0] 
      : "Conference Room B";

    setActiveCleaning({
      location: locationFromQR,
      startTime: new Date(),
      timer: 0,
      paused: false,
    });
    setCleaningElapsedTime(0);
  };

  const togglePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });
  };

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

  const completeSummary = () => {
    if (!activeCleaning) return false;
    
    const newCleaning = {
      id: (cleaningsHistory.length + 1).toString(),
      location: activeCleaning.location,
      date: new Date().toISOString().split('T')[0],
      startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
      status: "finished with scan",
      images: images.length,
      notes: summaryNotes,
      shiftId: activeShiftId,
      imageUrls: images
    };

    setCleaningsHistory([newCleaning, ...cleaningsHistory]);
    setActiveCleaning(null);
    setCleaningElapsedTime(0);
    setShowSummary(false);
    
    return true;
  };

  return {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    images,
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary,
    saveImagesToDatabase
  };
}
