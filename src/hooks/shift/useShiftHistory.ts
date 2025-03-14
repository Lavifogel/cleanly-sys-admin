
import { ShiftHistoryItem } from "@/hooks/useShift";
import { format } from "date-fns";

/**
 * Initial mock shift history data
 */
export function getInitialShiftHistory(): ShiftHistoryItem[] {
  return [
    {
      id: "1",
      date: "15/08/2023",
      startTime: "09:00",
      endTime: "17:00",
      duration: "8h",
      status: "finished with scan",
      cleanings: 5,
    },
    {
      id: "2",
      date: "14/08/2023",
      startTime: "08:30",
      endTime: "16:30",
      duration: "8h",
      status: "finished without scan",
      cleanings: 4,
    },
  ];
}

/**
 * Creates a new shift history item
 */
export function createShiftHistoryItem(
  shiftId: string,
  startTime: Date,
  endTime: Date,
  elapsedTime: number,
  status: string
): ShiftHistoryItem {
  return {
    id: shiftId,
    date: format(new Date(), "dd/MM/yyyy"),
    startTime: startTime.toTimeString().slice(0, 5),
    endTime: endTime.toTimeString().slice(0, 5),
    duration: `${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m`,
    status: status,
    cleanings: 0,
  };
}

