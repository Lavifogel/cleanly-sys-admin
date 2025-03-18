
/**
 * Interface for an active shift
 */
export interface Shift {
  startTime: Date;
  timer: number;
  id: string;
  location?: string;
  qrId?: string;
}

/**
 * Interface for a shift history item
 */
export interface ShiftHistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  cleanings: number;
}
