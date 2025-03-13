
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Shift {
  startTime: Date;
  timer: number;
  id: string;
}

export interface ShiftHistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  cleanings: number;
}

export function useShift() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState<null | Shift>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>([
    {
      id: "1",
      date: "2023-08-15",
      startTime: "09:00",
      endTime: "17:00",
      duration: "8h",
      status: "finished with scan",
      cleanings: 5,
    },
    {
      id: "2",
      date: "2023-08-14",
      startTime: "08:30",
      endTime: "16:30",
      duration: "8h",
      status: "finished without scan",
      cleanings: 4,
    },
  ]);

  // Fetch shift history from Supabase
  useEffect(() => {
    async function fetchShifts() {
      try {
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Check if there's an active shift
          const activeShiftData = data.find(shift => shift.status === 'active');
          
          if (activeShiftData) {
            const startTime = new Date(activeShiftData.start_time);
            const now = new Date();
            const elapsedMs = now.getTime() - startTime.getTime();
            const elapsedSec = Math.floor(elapsedMs / 1000);
            
            setActiveShift({
              startTime,
              timer: elapsedSec,
              id: activeShiftData.id
            });
            setElapsedTime(elapsedSec);
          }
          
          // Map shifts to history format
          const history = data.map(shift => {
            const startDate = new Date(shift.start_time || shift.created_at);
            const endDate = shift.end_time ? new Date(shift.end_time) : null;
            
            let duration = '';
            if (endDate) {
              const durationMs = endDate.getTime() - startDate.getTime();
              const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
              const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
              duration = `${durationHours}h ${durationMinutes}m`;
            }
            
            return {
              id: shift.id,
              date: startDate.toISOString().split('T')[0],
              startTime: startDate.toTimeString().slice(0, 5),
              endTime: endDate ? endDate.toTimeString().slice(0, 5) : '',
              duration: duration,
              status: shift.status,
              cleanings: 0 // We'll need to add a join query to count cleanings later
            };
          });
          
          setShiftsHistory(history);
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
        toast({
          title: "Error",
          description: "Failed to load shifts history.",
          variant: "destructive",
        });
      }
    }
    
    fetchShifts();
  }, [toast]);

  // Handle startShift
  const startShift = async (qrData: string) => {
    try {
      const shiftId = uuidv4();
      const startTime = new Date();
      
      // Get QR ID if it exists
      let qrId = null;
      if (qrData) {
        const { data: qrCodes } = await supabase
          .from('qr_codes')
          .select('qr_id')
          .eq('qr_value', qrData)
          .eq('type', 'Shift')
          .limit(1);
          
        if (qrCodes && qrCodes.length > 0) {
          qrId = qrCodes[0].qr_id;
        }
      }
      
      // Insert into database
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          id: shiftId,
          user_id: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID when auth is implemented
          qr_id: qrId,
          start_time: startTime.toISOString(),
          status: 'active'
        })
        .select();
      
      if (error) throw error;
      
      setActiveShift({
        startTime,
        timer: 0,
        id: shiftId,
      });
      setElapsedTime(0);
      
      toast({
        title: "Shift Started",
        description: "Your shift has been successfully started.",
      });
    } catch (error) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error",
        description: "Failed to start shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle endShift
  const endShift = async (withScan: boolean, qrData?: string) => {
    if (!activeShift) return;
    
    try {
      const endTime = new Date();
      
      // Get QR ID if provided and it's a scan
      let qrId = null;
      if (withScan && qrData) {
        const { data: qrCodes } = await supabase
          .from('qr_codes')
          .select('qr_id')
          .eq('qr_value', qrData)
          .eq('type', 'Shift')
          .limit(1);
          
        if (qrCodes && qrCodes.length > 0) {
          qrId = qrCodes[0].qr_id;
        }
      }
      
      // Update the shift in the database
      const { error } = await supabase
        .from('shifts')
        .update({
          end_time: endTime.toISOString(),
          status: withScan ? 'finished with scan' : 'finished without scan',
          qr_id: qrId || null
        })
        .eq('id', activeShift.id);
      
      if (error) throw error;
      
      const newShift = {
        id: activeShift.id,
        date: new Date().toISOString().split('T')[0],
        startTime: activeShift.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m`,
        status: withScan ? "finished with scan" : "finished without scan",
        cleanings: 0,
      };

      setShiftsHistory([newShift, ...shiftsHistory]);
      setActiveShift(null);
      setElapsedTime(0);
      
      // Show success toast
      toast({
        title: "Shift Ended",
        description: "Your shift has been successfully completed.",
        duration: 3000,
      });
      
      // Redirect to the login page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error ending shift:", error);
      toast({
        title: "Error",
        description: "Failed to end shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Timer effect for tracking shift time
  useEffect(() => {
    let interval: number | null = null;
    
    if (activeShift && !interval) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift]);

  return {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
  };
}
