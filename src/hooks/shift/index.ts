
import { useShiftState } from "./useShiftState";
import { useShiftActions } from "./useShiftActions";
import { useShiftTimer } from "./useShiftTimer";
import { Shift, ShiftHistoryItem } from "./types";

/**
 * Combined hook that provides all shift functionality
 */
export function useShift() {
  const {
    activeShift,
    setActiveShift,
    elapsedTime,
    setElapsedTime,
    shiftsHistory,
    setShiftsHistory
  } = useShiftState();
  
  const {
    startShift,
    endShift,
    autoEndShift
  } = useShiftActions(
    activeShift,
    elapsedTime,
    shiftsHistory,
    setActiveShift,
    setElapsedTime,
    setShiftsHistory
  );
  
  // Set up timer
  useShiftTimer(activeShift, setElapsedTime);

  return {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    autoEndShift,
  };
}

export type { Shift, ShiftHistoryItem };
