
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { formatTime } from "@/utils/cleaningUtils";

export function useCleaningSummary(
  activeCleaning: Cleaning | null,
  cleaningElapsedTime: number,
  cleaningsHistory: CleaningHistoryItem[],
  setCleaningsHistory: (history: CleaningHistoryItem[]) => void,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void
) {
  const { toast } = useToast();
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
  const completeSummary = (activeShiftId: string | undefined) => {
    if (!activeCleaning) return false;
    
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

  return {
    cleaningSummary,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary,
    prepareSummary,
    completeSummary
  };
}
