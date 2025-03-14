
export interface Cleaning {
  id?: string; // Added id property as optional to maintain backward compatibility
  location: string;
  startTime: Date;
  timer: number;
  paused: boolean;
}

export interface CleaningHistoryItem {
  id: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  images: number;
  notes: string;
  shiftId?: string;
  imageUrls?: string[];
  isActive?: boolean;
  elapsedTime?: number;
}

export interface CleaningSummary {
  location: string;
  startTime: string;
  endTime: string;
  duration: string;
  notes: string;
  images: string[];
}

// Database models matching our updated schema
export interface DbCleaning {
  id: string; // PK (UUID)
  shift_id: string; // FK to shifts
  qr_id?: string; // FK to qr_codes
  start_time: string; // Now a timestamp with timezone
  end_time?: string; // Now a timestamp with timezone
  status: 'active' | 'finished with scan' | 'finished without scan';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface DbImage {
  id: string; // PK (UUID)
  cleaning_id: string; // FK to cleanings
  image_url: string;
  created_at: string;
}

// Updated for unified schema - QR codes now include area information
export interface DbQrCode {
  qr_id: string; // PK (UUID)
  area_id: string; // Now a field in the qr_codes table
  area_name: string; // Now a field in the qr_codes table
  qr_value: string;
  type: 'Shift' | 'Cleaning';
  created_at: string;
  updated_at: string;
}

export interface DbShift {
  id: string; // PK (UUID)
  user_id: string; // FK to users
  qr_id?: string; // FK to qr_codes
  start_time: string; // Now a timestamp with timezone
  end_time?: string; // Now a timestamp with timezone
  status: 'active' | 'finished with scan' | 'finished without scan';
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string; // PK (UUID)
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  role: 'cleaner' | 'admin';
  start_date?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}
