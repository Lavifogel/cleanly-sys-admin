
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Activity, 
  formatDuration, 
  extractLocationFromNotes 
} from "./types";
import { processShiftsData } from "./dataProcessors/processShiftsData";
import { processCleaningsData } from "./dataProcessors/processCleaningsData";

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

      // Process data
      const shiftActivities = processShiftsData(shiftsData || []);
      const cleaningActivities = processCleaningsData(cleaningsData || []);

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
