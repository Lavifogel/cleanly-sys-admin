
import { useState, useEffect } from "react";
import { Cleaning } from "@/types/cleaning";
import { formatTime } from "@/utils/timeUtils";
import { useCleaningHistory } from "./useCleaningHistory";
import { useCleaningSummaryState } from "./useCleaningSummaryState";

export function useCleaningState(activeShiftId: string | undefined) {
  // Core cleaning state
  const [activeCleaning, setActiveCleaning] = useState<null | Cleaning>(null);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
  
  // Import history state from separate hook
  const { cleaningsHistory, setCleaningsHistory } = useCleaningHistory(activeShiftId);
  
  // Import summary state from separate hook
  const { 
    cleaningSummary, 
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary
  } = useCleaningSummaryState();

  // Load active cleaning from localStorage on component mount
  useEffect(() => {
    const storedCleaningData = localStorage.getItem('activeCleaning');
    const storedCleaningTimer = localStorage.getItem('cleaningTimer');
    const storedCleaningStartTime = localStorage.getItem('cleaningStartTime');
    
    if (storedCleaningData && storedCleaningStartTime) {
      try {
        const cleaningData = JSON.parse(storedCleaningData);
        const startTime = new Date(storedCleaningStartTime);
        const isPaused = localStorage.getItem('cleaningPaused') === 'true';
        
        // Only restore if the shift matches
        if (activeShiftId && cleaningData.shiftId === activeShiftId) {
          const savedCleaning: Cleaning = {
            id: cleaningData.id,
            location: cleaningData.location,
            startTime,
            timer: 0,
            paused: isPaused
          };
          
          setActiveCleaning(savedCleaning);
          
          if (storedCleaningTimer) {
            setCleaningElapsedTime(parseInt(storedCleaningTimer, 10));
          }
        }
      } catch (error) {
        console.error("Error parsing stored cleaning data:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('activeCleaning');
        localStorage.removeItem('cleaningTimer');
        localStorage.removeItem('cleaningStartTime');
        localStorage.removeItem('cleaningPaused');
      }
    }
  }, [activeShiftId]);

  // Save active cleaning to localStorage whenever it changes
  useEffect(() => {
    if (activeCleaning && activeShiftId) {
      localStorage.setItem('activeCleaning', JSON.stringify({
        id: activeCleaning.id,
        location: activeCleaning.location,
        shiftId: activeShiftId
      }));
      localStorage.setItem('cleaningStartTime', activeCleaning.startTime.toISOString());
      localStorage.setItem('cleaningPaused', activeCleaning.paused ? 'true' : 'false');
    } else {
      localStorage.removeItem('activeCleaning');
      localStorage.removeItem('cleaningStartTime');
      localStorage.removeItem('cleaningPaused');
    }
  }, [activeCleaning, activeShiftId]);

  // Save cleaning elapsed time when it changes
  useEffect(() => {
    if (activeCleaning && cleaningElapsedTime > 0) {
      localStorage.setItem('cleaningTimer', cleaningElapsedTime.toString());
    } else if (!activeCleaning) {
      localStorage.removeItem('cleaningTimer');
    }
  }, [activeCleaning, cleaningElapsedTime]);

  return {
    // State
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
    setCleaningsHistory,
    
    // Utility functions
    formatCleaningDuration: () => formatTime(cleaningElapsedTime)
  };
}
