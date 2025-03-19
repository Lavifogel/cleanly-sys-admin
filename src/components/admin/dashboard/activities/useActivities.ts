
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const fetchActivities = useCallback(async () => {
    // Only refetch if it's been more than 15 seconds since last refresh
    if (Date.now() - lastRefreshTime < 15000 && lastRefreshTime !== 0) {
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching activities data...");
      
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
          qr_codes!start_qr_id (
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
          qr_codes!start_qr_id (
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

      console.log("Fetched shifts data:", shiftsData?.length || 0, "records");
      console.log("Fetched cleanings data:", cleaningsData?.length || 0, "records");

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
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [lastRefreshTime]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
    
    // Set up a refresh interval every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    
    // Add event listener for visibility changes to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, refreshing activities data...");
        fetchActivities();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchActivities]);

  return {
    activities,
    loading,
    fetchActivities
  };
};

export default useActivities;
