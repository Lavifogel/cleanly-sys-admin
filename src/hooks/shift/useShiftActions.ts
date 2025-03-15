
import { useStartShift } from "./actions/useStartShift";
import { useEndShift } from "./actions/useEndShift";
import { useAutoEndShift } from "./actions/useAutoEndShift";
import { Shift, ShiftHistoryItem } from "./types";

/**
 * Combined hook that provides all shift action functionality
 */
export function useShiftActions(
  activeShift: Shift | null,
  elapsedTime: number,
  shiftsHistory: ShiftHistoryItem[],
  setActiveShift: (shift: Shift | null) => void,
  setElapsedTime: (time: number) => void,
  setShiftsHistory: (history: ShiftHistoryItem[]) => void
) {
  const { startShift } = useStartShift(setActiveShift, setElapsedTime);
  
  const { endShift } = useEndShift(
    activeShift,
    elapsedTime,
    shiftsHistory,
    setActiveShift,
    setElapsedTime,
    setShiftsHistory
  );
  
  const { autoEndShift } = useAutoEndShift(
    activeShift,
    elapsedTime,
    shiftsHistory,
    setActiveShift,
    setElapsedTime,
    setShiftsHistory
  );

  return {
    startShift,
    endShift,
    autoEndShift
  };
}
