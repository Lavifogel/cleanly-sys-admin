
import { useState, useEffect } from "react";
import { Shift, ShiftHistoryItem } from "./types";

export function useShiftState() {
  // State for tracking shift
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>([]);

  // Load active shift from local storage on component mount
  useEffect(() => {
    const storedShiftData = localStorage.getItem('activeShift');
    const storedShiftTimer = localStorage.getItem('shiftTimer');
    const storedStartTime = localStorage.getItem('shiftStartTime');
    
    if (storedShiftData && storedStartTime) {
      try {
        const shiftData = JSON.parse(storedShiftData);
        const startTime = new Date(storedStartTime);
        const savedShift: Shift = {
          ...shiftData,
          startTime
        };
        
        setActiveShift(savedShift);
        
        if (storedShiftTimer) {
          setElapsedTime(parseInt(storedShiftTimer, 10));
        }
      } catch (error) {
        console.error("Error parsing stored shift data:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('activeShift');
        localStorage.removeItem('shiftTimer');
        localStorage.removeItem('shiftStartTime');
      }
    }
  }, []);

  // Save active shift to local storage whenever it changes
  useEffect(() => {
    if (activeShift) {
      // Store shift data in localStorage for retrieval on logout/refresh
      const shiftDataToStore = {
        id: activeShift.id,
      };

      // Only include location and qrId if they exist
      if (activeShift.location) {
        shiftDataToStore['location'] = activeShift.location;
      }
      
      if (activeShift.qrId) {
        shiftDataToStore['qrId'] = activeShift.qrId;
      }
      
      localStorage.setItem('activeShift', JSON.stringify(shiftDataToStore));
      localStorage.setItem('shiftStartTime', activeShift.startTime.toISOString());
    } else {
      // If there's no active shift, remove the stored data
      localStorage.removeItem('activeShift');
      localStorage.removeItem('shiftStartTime');
    }
  }, [activeShift]);

  // Save elapsed time to localStorage when it changes
  useEffect(() => {
    if (activeShift && elapsedTime > 0) {
      localStorage.setItem('shiftTimer', elapsedTime.toString());
    } else if (!activeShift) {
      localStorage.removeItem('shiftTimer');
    }
  }, [activeShift, elapsedTime]);

  return {
    activeShift,
    setActiveShift,
    elapsedTime,
    setElapsedTime,
    shiftsHistory,
    setShiftsHistory
  };
}
