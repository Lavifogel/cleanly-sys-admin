
import { useCleaningState } from "./useCleaningState";
import { useCleaningActions } from "./useCleaningActions";
import { useCleaningSummary } from "./useCleaningSummary";
import { useCleaningTimer } from "@/hooks/useCleaningTimer";
import { getActiveCleaningForShift, getCleaningHistoryForShift } from "@/hooks/activityLogs/useActivityLogService";
import { useEffect } from "react";

export function useCleaning(activeShiftId: string | undefined) {
  // Initialize state management
  const {
    activeCleaning,
    setActiveCleaning,
    cleaningElapsedTime,
    setCleaningElapsedTime,
    cleaningSummary,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary,
    cleaningsHistory,
    setCleaningsHistory
  } = useCleaningState(activeShiftId);
  
  // Initialize cleaning actions
  const {
    startCleaning,
    togglePauseCleaning,
    autoEndCleaning
  } = useCleaningActions(
    activeShiftId,
    activeCleaning,
    setActiveCleaning,
    setCleaningElapsedTime,
    cleaningsHistory,
    setCleaningsHistory
  );
  
  // Initialize summary functionality
  const {
    images,
    isUploading,
    addImage,
    removeImage,
    prepareSummary,
    completeSummary,
    saveImagesToDatabase
  } = useCleaningSummary(
    activeShiftId,
    activeCleaning,
    cleaningElapsedTime,
    setActiveCleaning,
    setCleaningElapsedTime,
    cleaningsHistory,
    setCleaningsHistory,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    setShowSummary
  );
  
  // Set up the timer
  useCleaningTimer(activeCleaning, setCleaningElapsedTime);

  // Load active cleaning from activity logs when component mounts
  useEffect(() => {
    const fetchCleaningData = async () => {
      try {
        if (activeShiftId) {
          // Load active cleaning from activity logs
          const activeCleaningData = await getActiveCleaningForShift(activeShiftId);
          
          if (activeCleaningData) {
            setActiveCleaning({
              id: activeCleaningData.id,
              startTime: activeCleaningData.startTime,
              location: activeCleaningData.location || "Unknown Location",
              timer: 0,
              paused: activeCleaningData.paused
            });
            
            // Calculate elapsed time since cleaning started
            const now = new Date();
            const elapsedMs = now.getTime() - activeCleaningData.startTime.getTime();
            setCleaningElapsedTime(Math.floor(elapsedMs / 1000));
          }
          
          // Load cleaning history
          const cleaningHistory = await getCleaningHistoryForShift(activeShiftId);
          if (cleaningHistory && cleaningHistory.length > 0) {
            setCleaningsHistory(cleaningHistory);
          }
        }
      } catch (error) {
        console.error("Error loading cleaning data:", error);
      }
    };
    
    fetchCleaningData();
  }, [activeShiftId, setActiveCleaning, setCleaningElapsedTime, setCleaningsHistory]);

  // Return a consolidated API
  return {
    // State
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    images,
    
    // Actions
    startCleaning,
    togglePauseCleaning,
    autoEndCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary,
    saveImagesToDatabase
  };
}
