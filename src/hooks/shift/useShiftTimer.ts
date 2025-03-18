
import { useEffect, useRef } from "react";
import { Shift } from "@/hooks/shift/types";

/**
 * Hook for managing the shift timer with optimized performance
 */
export function useShiftTimer(
  activeShift: Shift | null,
  setElapsedTime: React.Dispatch<React.SetStateAction<number>>
) {
  // Use a ref to track the interval
  const intervalRef = useRef<number | null>(null);
  
  // Use a ref to track if the shift is active to avoid dependency array issues
  const isActiveRef = useRef<boolean>(!!activeShift);
  
  // Update the ref when activeShift changes
  useEffect(() => {
    isActiveRef.current = !!activeShift;
  }, [activeShift]);
  
  // Timer effect for tracking shift time
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (activeShift) {
      // Use a more efficient approach by tracking time since start
      // instead of incrementing a counter for each second
      const startTime = activeShift.startTime.getTime();
      
      intervalRef.current = window.setInterval(() => {
        if (isActiveRef.current) {
          // Calculate elapsed time based on the difference from start time
          // This ensures accuracy even if the timer is temporarily paused
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);
          setElapsedTime(elapsedSeconds);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeShift, setElapsedTime]);
}
