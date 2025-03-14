
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

  // Handle startShift
  const startShift = async (qrData: string) => {
    try {
      const newShiftId = uuidv4();
      const startTime = new Date();
      
      // Parse QR code data if it exists
      let qrId = null;
      try {
        const qrDataObj = JSON.parse(qrData);
        if (qrDataObj && qrDataObj.areaId) {
          // Get the QR code ID from the database using area ID
          const { data: qrCodes, error: qrError } = await supabase
            .from('qr_codes')
            .select('qr_id, qr_value')
            .eq('area_id', qrDataObj.areaId)
            .eq('type', 'Shift')
            .limit(1);
          
          if (qrError) {
            console.error("Error fetching QR code:", qrError);
          } else if (qrCodes && qrCodes.length > 0) {
            qrId = qrCodes[0].qr_id;
          }
        }
      } catch (e) {
        console.error("Error parsing QR data:", e);
        // Continue with null qrId if parsing fails
      }
      
      // Create a proper UUID for the user ID (in a real app, get this from auth)
      const temporaryUserId = uuidv4();
      
      // Store the shift in the database
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          id: newShiftId,
          user_id: temporaryUserId,
          start_time: startTime.toISOString(),
          status: 'active',
          qr_id: qrId
        });
      
      if (error) {
        console.error("Error storing shift:", error);
        toast({
          title: "Error",
          description: "Failed to start shift. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Shift stored successfully:", data);
      
      // Update the local state
      setActiveShift({
        startTime: startTime,
        timer: 0,
        id: newShiftId,
      });
      setElapsedTime(0);
      
      toast({
        title: "Shift Started",
        description: "Your shift has been started successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error in startShift:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to allow the calling component to handle it
    }
  };

  // Handle endShift
  const endShift = async (withScan: boolean, qrData?: string) => {
    if (!activeShift) return;
    
    try {
      const endTime = new Date();
      
      // Update the shift in the database
      const { error } = await supabase
        .from('shifts')
        .update({
          end_time: endTime.toISOString(),
          status: withScan ? "finished with scan" : "finished without scan"
        })
        .eq('id', activeShift.id);
      
      if (error) {
        console.error("Error updating shift:", error);
        toast({
          title: "Error",
          description: "Failed to end shift. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update the local state
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
      console.error("Error in endShift:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
