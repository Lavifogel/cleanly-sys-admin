
/**
 * Activity types supported in the unified activity_logs table
 */
export type ActivityType = 'shift_start' | 'shift_end' | 'cleaning_start' | 'cleaning_end' | 'login' | 'logout';

/**
 * Represents an activity log entry in the database
 */
export interface ActivityLog {
  id: string;
  user_id: string;
  qr_id?: string | null;
  activity_type: ActivityType;
  start_time: string;
  end_time?: string | null;
  status: string;
  notes?: string | null;
  related_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for creating a new activity log
 */
export interface CreateActivityLogParams {
  user_id: string;
  qr_id?: string | null;
  activity_type: ActivityType;
  start_time: string;
  end_time?: string | null;
  status: string;
  notes?: string | null;
  related_id?: string | null;
}

/**
 * Request interface for activity logs - alias for backward compatibility
 */
export type ActivityLogRequest = CreateActivityLogParams;

/**
 * Interface for updating an activity log
 */
export interface UpdateActivityLogParams {
  end_time?: string;
  status?: string;
  notes?: string;
}

/**
 * Structure to represent an active shift derived from activity logs
 */
export interface ActiveShift {
  id: string;           // ID of the shift_start log
  qrId?: string;        // QR code ID if associated
  startTime: Date;      // When the shift started
  userId: string;       // User who started the shift
  status: string;       // Current status 
  location?: string;    // Location name if available
}

/**
 * Structure to represent an active cleaning derived from activity logs
 */
export interface ActiveCleaning {
  id: string;           // ID of the cleaning_start log
  shiftId: string;      // Related shift ID
  qrId?: string;        // QR code ID if associated
  startTime: Date;      // When the cleaning started
  userId: string;       // User who started the cleaning
  status: string;       // Current status
  location?: string;    // Location name if available
  notes?: string;       // Any notes associated with the cleaning
  paused: boolean;      // Whether the cleaning is paused
}

/**
 * Structure for activity log based shift history
 */
export interface ShiftHistoryItem {
  id: string;           // ID of the shift_start log
  date: string;         // Formatted date of the shift
  startTime: string;    // Formatted start time
  endTime: string | null; // Formatted end time or null if active
  duration: string;     // Formatted duration
  status: string;       // Status of the shift
  cleanings: number;    // Number of cleanings in this shift
  location?: string;    // Location name if available
}

/**
 * Structure for activity log based cleaning history
 */
export interface CleaningHistoryItem {
  id: string;           // ID of the cleaning_start log
  location: string;     // Location name
  date: string;         // Formatted date
  startTime: string;    // Formatted start time
  endTime: string | null; // Formatted end time or null if active
  duration: string;     // Formatted duration
  status: string;       // Status of the cleaning
  notes: string;        // Notes for the cleaning
  images: number;       // Number of associated images
  shiftId: string;      // Related shift ID
  imageUrls?: string[]; // URLs of associated images
  isActive?: boolean;   // Whether this is the active cleaning
}
