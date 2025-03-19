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
