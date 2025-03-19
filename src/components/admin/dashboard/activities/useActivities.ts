
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Activity, 
  formatDuration, 
  extractLocationFromNotes 
} from "./types";

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
      console.log("Fetching activities data from the unified activity_logs table...");
      
      // Fetch from the unified activity_logs table
      const { data: activityLogs, error: activityError } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          qr_id,
          activity_type,
          start_time,
          end_time,
          status,
          notes,
          related_id,
          users:user_id (
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
        .limit(200);

      if (activityError) throw activityError;

      console.log("Fetched activities data:", activityLogs?.length || 0, "records");

      if (!activityLogs || activityLogs.length === 0) {
        setActivities([]);
        setLoading(false);
        setLastRefreshTime(Date.now());
        return;
      }

      // Process data into a unified format
      const processedActivities = activityLogs.map(log => {
        const userName = log.users?.full_name || 
                       (log.users?.first_name && log.users?.last_name 
                         ? `${log.users.first_name} ${log.users.last_name}` 
                         : "Unknown User");
        
        const startTime = log.start_time ? new Date(log.start_time) : new Date();
        const endTime = log.end_time ? new Date(log.end_time) : null;
        
        // Calculate duration only if we have both start and end times
        const duration = endTime 
          ? formatDuration(startTime, endTime) 
          : "In progress";
        
        // Get location from QR code or notes
        const location = log.qr_codes?.area_name || extractLocationFromNotes(log.notes) || "Unknown Location";

        // Determine activity type for display
        const activityType = log.activity_type.includes('shift') ? 'shift' : 'cleaning';

        return {
          id: log.id,
          type: activityType,
          date: format(startTime, "MMM dd, yyyy"),
          userName,
          location,
          startTime: format(startTime, "HH:mm"),
          endTime: endTime ? format(endTime, "HH:mm") : null,
          duration,
          status: log.status
        };
      });

      // Combine and sort activities by date and start time
      processedActivities.sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Then sort by start time (newest first)
        return b.startTime.localeCompare(a.startTime);
      });

      setActivities(processedActivities);
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
