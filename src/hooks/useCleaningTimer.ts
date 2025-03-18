
import { useEffect, useRef } from "react";
import { Cleaning } from "@/types/cleaning";

export function useCleaningTimer(
  activeCleaning: Cleaning | null,
  setCleaningElapsedTime: (time: number | ((prev: number) => number)) => void
) {
  // Use refs for better performance
  const intervalRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  
  // Update refs when cleaning status changes
  useEffect(() => {
    isActiveRef.current = !!activeCleaning;
    isPausedRef.current = activeCleaning?.paused || false;
  }, [activeCleaning]);
  
  useEffect(() => {
    // Clean up any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (activeCleaning && !activeCleaning.paused) {
      // Calculate elapsed time based on start time for better accuracy
      const startTime = activeCleaning.startTime.getTime();
      const initialOffset = activeCleaning.timer || 0;
      
      intervalRef.current = window.setInterval(() => {
        if (isActiveRef.current && !isPausedRef.current) {
          // Use a functional update to avoid stale state issues
          setCleaningElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeCleaning, setCleaningElapsedTime]);
}
