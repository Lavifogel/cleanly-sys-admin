
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Activity, formatDuration, extractLocationFromNotes } from "./types";

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch shifts with user information
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select(`
          id,
          start_time,
          end_time,
          status,
          users (
            id,
            first_name,
            last_name,
            full_name
          ),
          qr_codes (
            area_name
          )
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (shiftsError) throw shiftsError;

      // Fetch cleanings with shift and user information
      const { data: cleaningsData, error: cleaningsError } = await supabase
        .from('cleanings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          qr_codes (
            area_name
          ),
          shifts (
            users (
              id,
              first_name,
              last_name,
              full_name
            )
          )
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (cleaningsError) throw cleaningsError;

      // Process shifts data
      const shiftActivities: Activity[] = (shiftsData || []).map(shift => {
        const userName = shift.users?.full_name || 
                        (shift.users?.first_name && shift.users?.last_name 
                          ? `${shift.users.first_name} ${shift.users.last_name}` 
                          : "Unknown User");
        
        const startTime = shift.start_time ? new Date(shift.start_time) : new Date();
        const endTime = shift.end_time ? new Date(shift.end_time) : null;
        
        const duration = endTime 
          ? formatDuration(startTime, endTime) 
          : "In progress";

        return {
          id: shift.id,
          type: "shift",
          date: format(startTime, "MMM dd, yyyy"),
          userName,
          location: shift.qr_codes?.area_name || null,
          startTime: format(startTime, "HH:mm"),
          endTime: endTime ? format(endTime, "HH:mm") : null,
          duration,
          status: shift.status
        };
      });

      // Process cleanings data
      const cleaningActivities: Activity[] = (cleaningsData || []).map(cleaning => {
        const userName = cleaning.shifts?.users?.full_name || 
                        (cleaning.shifts?.users?.first_name && cleaning.shifts?.users?.last_name 
                          ? `${cleaning.shifts.users.first_name} ${cleaning.shifts.users.last_name}` 
                          : "Unknown User");
        
        const startTime = cleaning.start_time ? new Date(cleaning.start_time) : new Date();
        const endTime = cleaning.end_time ? new Date(cleaning.end_time) : null;
        
        const duration = endTime 
          ? formatDuration(startTime, endTime) 
          : "In progress";

        return {
          id: cleaning.id,
          type: "cleaning",
          date: format(startTime, "MMM dd, yyyy"),
          userName,
          location: cleaning.qr_codes?.area_name || extractLocationFromNotes(cleaning.notes),
          startTime: format(startTime, "HH:mm"),
          endTime: endTime ? format(endTime, "HH:mm") : null,
          duration,
          status: cleaning.status
        };
      });

      // Combine and sort activities by date and start time
      const allActivities = [...shiftActivities, ...cleaningActivities].sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Then sort by start time (newest first)
        return b.startTime.localeCompare(a.startTime);
      });

      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    fetchActivities
  };
};

export default useActivities;
