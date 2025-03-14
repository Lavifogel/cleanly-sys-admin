
import { useCleaningState } from "./useCleaningState";
import { useCleaningActions } from "./useCleaningActions";
import { useCleaningSummary } from "./useCleaningSummary";
import { useCleaningTimer } from "@/hooks/useCleaningTimer";

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
