
import { useState, useEffect } from "react";
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get active cleaners (users with role 'cleaner' who are currently in an active shift)
      const { data: activeShifts, error: shiftsError } = await supabase
        .from('shifts')
        .select('id, user_id')
        .eq('status', 'active')
        .is('end_time', null);

      if (shiftsError) throw shiftsError;

      // Get areas cleaned today
      const today = new Date().toISOString().split('T')[0];
      const { data: cleaningsToday, error: cleaningsError } = await supabase
        .from('cleanings')
        .select('id')
        .gte('start_time', today)
        .eq('status', 'finished with scan');

      if (cleaningsError) throw cleaningsError;

      // Get areas pending (active cleanings that haven't been completed)
      const { data: pendingCleanings, error: pendingError } = await supabase
        .from('cleanings')
        .select('id')
        .eq('status', 'active');

      if (pendingError) throw pendingError;

      // Get total shifts 
      const { count: totalShifts, error: totalShiftsError } = await supabase
        .from('shifts')
        .select('id', { count: 'exact', head: true });

      if (totalShiftsError) throw totalShiftsError;

      // Get total cleanings
      const { count: totalCleanings, error: totalCleaningsError } = await supabase
        .from('cleanings')
        .select('id', { count: 'exact', head: true });

      if (totalCleaningsError) throw totalCleaningsError;

      // Calculate average cleaning time from completed cleanings
      const { data: completedCleanings, error: completedCleaningsError } = await supabase
        .from('cleanings')
        .select('start_time, end_time')
        .not('end_time', 'is', null)
        .limit(100);

      if (completedCleaningsError) throw completedCleaningsError;

      // Calculate average cleaning time
      let avgCleaningTime = 32; // Default fallback value
      if (completedCleanings && completedCleanings.length > 0) {
        const cleaningTimes = completedCleanings.map(cleaning => {
          const start = new Date(cleaning.start_time as string);
          const end = new Date(cleaning.end_time as string);
          return (end.getTime() - start.getTime()) / (1000 * 60); // Time in minutes
        }).filter(time => time > 0 && time < 240); // Filter out outliers

        if (cleaningTimes.length > 0) {
          avgCleaningTime = Math.round(
            cleaningTimes.reduce((sum, time) => sum + time, 0) / cleaningTimes.length
          );
        }
      }

      setStats({
        activeCleaners: activeShifts?.length || 0,
        areasCleaned: cleaningsToday?.length || 0,
        areasPending: pendingCleanings?.length || 0,
        avgCleaningTime,
        totalShifts: totalShifts || 0,
        totalCleanings: totalCleanings || 0,
      });
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
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, refreshData: fetchDashboardData };
}
