
import { useEffect } from "react";
import { Cleaning } from "@/types/cleaning";

export function useCleaningTimer(
  activeCleaning: Cleaning | null,
  setCleaningElapsedTime: (time: number) => void
) {
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
  }, [activeCleaning, setCleaningElapsedTime]);
}
