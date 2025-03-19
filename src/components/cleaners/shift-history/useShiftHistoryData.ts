
import { useState } from "react";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useShiftHistoryData = (shiftsHistory: ShiftHistoryItem[]) => {
  const { toast } = useToast();
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaningsData, setCleaningsData] = useState<{
    [shiftId: string]: {
      cleanings: any[];
      loaded: boolean;
    }
  }>({});

  const toggleShift = async (shiftId: string) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null);
      return;
    }
    
    setExpandedShift(shiftId);
    
    if (cleaningsData[shiftId]?.loaded) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('cleanings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          qr_codes!start_qr_id(area_name),
          images(id, image_url)
        `)
        .eq('shift_id', shiftId)
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error("Error fetching cleanings:", error);
        throw error;
      }
      
      setCleaningsData({
        ...cleaningsData,
        [shiftId]: {
          cleanings: data || [],
          loaded: true
        }
      });
    } catch (error: any) {
      toast({
        title: "Error fetching cleanings",
        description: error.message || "Failed to get cleaning details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatStartTime = (shift: ShiftHistoryItem) => {
    const dateTime = `${shift.date} ${shift.startTime}`;
    const date = new Date(dateTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    return format(date, 'h:mm a');
  };

  const formatEndTime = (shift: ShiftHistoryItem) => {
    if (!shift.endTime) return "In progress";
    const dateTime = `${shift.date} ${shift.endTime}`;
    const date = new Date(dateTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'));
    return format(date, 'h:mm a');
  };

  const getLocationFromNotes = (notes: string) => {
    if (!notes) return "Unknown location";
    const locationMatch = notes.match(/Location:\s*([^,\n]*)/i);
    return locationMatch ? locationMatch[1] : "Unknown location";
  };

  return {
    expandedShift,
    loading,
    cleaningsData,
    toggleShift,
    formatStartTime,
    formatEndTime,
    getLocationFromNotes
  };
};
