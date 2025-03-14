
import { useState } from "react";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";
import { getInitialShiftHistory } from "@/hooks/shift/useShiftHistory";

/**
 * Hook for managing shift state
 */
export function useShiftState() {
  const [activeShift, setActiveShift] = useState<null | Shift>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>(getInitialShiftHistory());

  return {
    activeShift,
    setActiveShift,
    elapsedTime,
    setElapsedTime,
    shiftsHistory,
    setShiftsHistory
  };
}
