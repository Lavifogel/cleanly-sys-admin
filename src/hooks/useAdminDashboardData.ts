
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type DashboardStats = {
  activeCleaners: number;
  areasCleaned: number;
  areasPending: number;
  avgCleaningTime: number;
};

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeCleaners: 0,
    areasCleaned: 0,
    areasPending: 0,
    avgCleaningTime: 32,
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
        .eq('status', 'finished');

      if (cleaningsError) throw cleaningsError;

      // Get areas pending (active cleanings that haven't been completed)
      const { data: pendingCleanings, error: pendingError } = await supabase
        .from('cleanings')
        .select('id')
        .eq('status', 'active');

      if (pendingError) throw pendingError;

      // Calculate average cleaning time
      // In a real app, you'd calculate this from completed cleanings
      // For now, we'll keep the hardcoded value of 32 minutes

      setStats({
        activeCleaners: activeShifts?.length || 0,
        areasCleaned: cleaningsToday?.length || 0,
        areasPending: pendingCleanings?.length || 0,
        avgCleaningTime: 32, // Default value, would be calculated in a real app
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
