
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

// Database models matching our new schema
export interface DbCleaning {
  id: string;
  shift_id: string;
  area_id: string;
  qr_id?: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'finished with scan' | 'finished without scan';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface DbImage {
  id: string;
  cleaning_id: string;
  image_url: string;
  created_at: string;
}

export interface DbArea {
  area_id: string;
  area_name: string;
  created_at: string;
  updated_at: string;
}
