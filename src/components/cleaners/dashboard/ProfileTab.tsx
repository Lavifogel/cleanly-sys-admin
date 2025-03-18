
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import CleaningHistoryCard from "@/components/cleaners/CleaningHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";
import { CleaningHistoryItem } from "@/types/cleaning";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/useUserData";
import { format, parseISO } from "date-fns";
import { ShiftHistoryItem } from "@/hooks/shift/types";

interface ProfileTabProps {
  shiftsHistory?: ShiftHistoryItem[];
  cleaningsHistory?: CleaningHistoryItem[];
}

const ProfileTab = ({ shiftsHistory: initialShifts = [], cleaningsHistory = [] }: ProfileTabProps) => {
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>(initialShifts);
  const { user } = useUserData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShiftsHistory = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data: shifts, error } = await supabase
          .from('shifts')
          .select(`
            id,
            start_time,
            end_time,
            status,
            qr_codes(area_name)
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching shifts:', error);
          return;
        }

        // Count cleanings for each shift
        const shiftsWithDetails = await Promise.all(shifts.map(async (shift) => {
          // Get cleaning count for this shift
          const { count, error: countError } = await supabase
            .from('cleanings')
            .select('*', { count: 'exact', head: true })
            .eq('shift_id', shift.id);

          if (countError) {
            console.error('Error counting cleanings:', countError);
            return null;
          }

          const startTime = shift.start_time ? parseISO(shift.start_time) : new Date();
          const endTime = shift.end_time ? parseISO(shift.end_time) : null;

          // Calculate duration
          let duration = "In progress";
          if (endTime) {
            const durationMs = endTime.getTime() - startTime.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${hours}h ${minutes}m`;
          }

          return {
            id: shift.id,
            date: format(startTime, 'MMM dd, yyyy'),
            startTime: format(startTime, 'HH:mm'),
            endTime: endTime ? format(endTime, 'HH:mm') : "--:--",
            duration,
            status: shift.status,
            cleanings: count || 0
          };
        }));

        setShiftsHistory(shiftsWithDetails.filter(Boolean) as ShiftHistoryItem[]);
      } catch (error) {
        console.error('Error processing shifts data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShiftsHistory();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <ShiftHistoryCard 
        shiftsHistory={shiftsHistory} 
        isLoading={isLoading} 
      />
      <ProfileCard />
    </div>
  );
};

export default ProfileTab;
