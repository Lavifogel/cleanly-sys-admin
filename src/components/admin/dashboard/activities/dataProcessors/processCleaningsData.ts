
import { format } from "date-fns";
import { Activity, formatDuration, extractLocationFromNotes } from "../types";

export interface CleaningData {
  id: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  notes: string | null;
  qr_codes: {
    area_name: string | null;
  } | null;
  shifts: {
    users: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      full_name: string | null;
    } | null;
  } | null;
}

export const processCleaningsData = (cleaningsData: CleaningData[]): Activity[] => {
  return cleaningsData.map(cleaning => {
    const userName = cleaning.shifts?.users?.full_name || 
                    (cleaning.shifts?.users?.first_name && cleaning.shifts?.users?.last_name 
                      ? `${cleaning.shifts.users.first_name} ${cleaning.shifts.users.last_name}` 
                      : "Unknown User");
    
    const startTime = cleaning.start_time ? new Date(cleaning.start_time) : new Date();
    const endTime = cleaning.end_time ? new Date(cleaning.end_time) : null;
    
    // Calculate duration only if we have both start and end times
    const duration = endTime 
      ? formatDuration(startTime, endTime) 
      : "In progress";

    // Get location from QR code or notes
    const location = cleaning.qr_codes?.area_name || extractLocationFromNotes(cleaning.notes) || "Unknown Location";

    return {
      id: cleaning.id,
      type: "cleaning",
      date: format(startTime, "MMM dd, yyyy"),
      userName,
      location,
      startTime: format(startTime, "HH:mm"),
      endTime: endTime ? format(endTime, "HH:mm") : null,
      duration,
      status: cleaning.status || "active"
    };
  });
};
