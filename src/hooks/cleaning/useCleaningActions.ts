
import { Cleaning } from "@/types/cleaning";
import { useStartCleaning } from "./actions/useStartCleaning";
import { useTogglePauseCleaning } from "./actions/useTogglePauseCleaning";
import { useAutoEndCleaning } from "./actions/useAutoEndCleaning";

export function useCleaningActions(
  activeShiftId: string | undefined, 
  activeCleaning: Cleaning | null,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  cleaningsHistory: any[],
  setCleaningsHistory: (history: any[]) => void
) {
  // Import start cleaning functionality
  const { startCleaning } = useStartCleaning(
    activeShiftId,
    setActiveCleaning,
    setCleaningElapsedTime
  );

  // Import toggle pause functionality
  const { togglePauseCleaning } = useTogglePauseCleaning(
    activeCleaning,
    setActiveCleaning
  );

  // Import auto end cleaning functionality
  const { autoEndCleaning } = useAutoEndCleaning(
    activeCleaning,
    activeShiftId,
    cleaningsHistory,
    setActiveCleaning,
    setCleaningElapsedTime,
    setCleaningsHistory
  );

  return {
    startCleaning,
    togglePauseCleaning,
    autoEndCleaning
  };
}
