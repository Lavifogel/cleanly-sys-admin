
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DashboardStats = {
  activeCleaners: number;
  areasCleaned: number;
  areasPending: number;
  avgCleaningTime: number;
  totalShifts?: number;
  totalCleanings?: number;
};

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeCleaners: 0,
    areasCleaned: 0,
    areasPending: 0,
    avgCleaningTime: 32,
    totalShifts: 0,
    totalCleanings: 0,
  });
  const { toast } = useToast();
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchDashboardData = useCallback(async () => {
    // If it's been less than 30 seconds since the last refresh, don't fetch again
    if (Date.now() - lastRefreshTime < 30000) {
      return;
    }
    
    setLoading(true);
    try {
      // Use a single Promise.all to make parallel requests for better performance
      const [
        activeShiftsResult,
        cleaningsTodayResult,
        pendingCleaningsResult,
        totalShiftsResult,
        totalCleaningsResult,
        completedCleaningsResult
      ] = await Promise.all([
        // Get active cleaners (users with role 'cleaner' who are currently in an active shift)
        supabase
          .from('shifts')
          .select('id, user_id', { count: 'exact' })
          .eq('status', 'active')
          .is('end_time', null),
        
        // Get areas cleaned today
        supabase
          .from('cleanings')
          .select('id', { count: 'exact' })
          .gte('start_time', new Date().toISOString().split('T')[0])
          .eq('status', 'finished with scan'),
        
        // Get areas pending (active cleanings that haven't been completed)
        supabase
          .from('cleanings')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Get total shifts count
        supabase
          .from('shifts')
          .select('id', { count: 'exact', head: true }),
        
        // Get total cleanings count
        supabase
          .from('cleanings')
          .select('id', { count: 'exact', head: true }),
        
        // Calculate average cleaning time from completed cleanings
        supabase
          .from('cleanings')
          .select('start_time, end_time')
          .not('end_time', 'is', null)
          .limit(50) // Reduced from 100 to 50 for better performance
      ]);

      // Check for errors
      if (activeShiftsResult.error) throw activeShiftsResult.error;
      if (cleaningsTodayResult.error) throw cleaningsTodayResult.error;
      if (pendingCleaningsResult.error) throw pendingCleaningsResult.error;
      if (totalShiftsResult.error) throw totalShiftsResult.error;
      if (totalCleaningsResult.error) throw totalCleaningsResult.error;
      if (completedCleaningsResult.error) throw completedCleaningsResult.error;

      // Calculate average cleaning time
      let avgCleaningTime = 32; // Default fallback value
      if (completedCleaningsResult.data && completedCleaningsResult.data.length > 0) {
        const cleaningTimes = completedCleaningsResult.data
          .map(cleaning => {
            const start = new Date(cleaning.start_time as string);
            const end = new Date(cleaning.end_time as string);
            return (end.getTime() - start.getTime()) / (1000 * 60); // Time in minutes
          })
          .filter(time => time > 0 && time < 240); // Filter out outliers

        if (cleaningTimes.length > 0) {
          avgCleaningTime = Math.round(
            cleaningTimes.reduce((sum, time) => sum + time, 0) / cleaningTimes.length
          );
        }
      }

      setStats({
        activeCleaners: activeShiftsResult.data?.length || 0,
        areasCleaned: cleaningsTodayResult.data?.length || 0,
        areasPending: pendingCleaningsResult.data?.length || 0,
        avgCleaningTime,
        totalShifts: totalShiftsResult.count || 0,
        totalCleanings: totalCleaningsResult.count || 0,
      });
      
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error fetching dashboard data",
        description: "There was a problem loading the dashboard statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, lastRefreshTime]);

  useEffect(() => {
    fetchDashboardData();

    // Set up a refresh interval (every 2 minutes instead of 5)
    const interval = setInterval(fetchDashboardData, 2 * 60 * 1000);
    
    // Add event listener for visibility changes to refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if it's been more than 1 minute
        if (Date.now() - lastRefreshTime > 60000) {
          fetchDashboardData();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData, lastRefreshTime]);

  return { 
    stats, 
    loading, 
    refreshData: fetchDashboardData 
  };
}
