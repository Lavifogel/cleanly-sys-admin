
export interface Cleaning {
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

// Database models matching our schema
export interface DbCleaning {
  id: string; // PK (UUID)
  shift_id: string; // FK to shifts
  area_id: string; // FK to areas
  qr_id?: string; // FK to qr_codes
  start_time: string;
  end_time?: string;
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

export interface DbArea {
  area_id: string; // PK
  area_name: string;
  created_at: string;
  updated_at: string;
}

export interface DbQrCode {
  qr_id: string; // PK (UUID)
  qr_value: string;
  area_id?: string; // FK to areas
  type: 'Shift' | 'Cleaning';
  created_at: string;
}

export interface DbShift {
  id: string; // PK (UUID)
  user_id: string; // FK to users
  qr_id?: string; // FK to qr_codes
  start_date: string;
  start_time: string;
  end_date?: string;
  end_time?: string;
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
