
import { useEffect } from "react";
import { Shift } from "@/hooks/shift/types";

/**
 * Hook for managing the shift timer
 */
export function useShiftTimer(
  activeShift: Shift | null,
  setElapsedTime: (time: number) => void
) {
  // Timer effect for tracking shift time
  useEffect(() => {
    let interval: number | null = null;
    
    if (activeShift && !interval) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift, setElapsedTime]);
}
