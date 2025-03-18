
import { format } from "date-fns";
import { Activity, formatDuration } from "../types";

export interface ShiftData {
  id: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
  } | null;
  qr_codes: {
    area_name: string | null;
  } | null;
}

export const processShiftsData = (shiftsData: ShiftData[]): Activity[] => {
  return shiftsData.map(shift => {
    const userName = shift.users?.full_name || 
                    (shift.users?.first_name && shift.users?.last_name 
                      ? `${shift.users.first_name} ${shift.users.last_name}` 
                      : "Unknown User");
    
    const startTime = shift.start_time ? new Date(shift.start_time) : new Date();
    const endTime = shift.end_time ? new Date(shift.end_time) : null;
    
    const duration = endTime 
      ? formatDuration(startTime, endTime) 
      : "In progress";

    // Standardize the status display
    let displayStatus = shift.status;
    
    // Map database statuses to display statuses if needed
    if (displayStatus === "finished automatically") {
      displayStatus = "finished automatically";
    }

    return {
      id: shift.id,
      type: "shift",
      date: format(startTime, "MMM dd, yyyy"),
      userName,
      location: shift.qr_codes?.area_name || null,
      startTime: format(startTime, "HH:mm"),
      endTime: endTime ? format(endTime, "HH:mm") : null,
      duration,
      status: displayStatus
    };
  });
};
