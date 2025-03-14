
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
      
      console.log("Starting shift with QR data:", qrData);
      
      // Parse QR code data if it exists
      let qrId = null;
      let areaId = null;
      let areaName = null;
      
      try {
        const qrDataObj = JSON.parse(qrData);
        console.log("Parsed QR data:", qrDataObj);
        
        if (qrDataObj) {
          areaId = qrDataObj.areaId;
          areaName = qrDataObj.areaName || `Area ${Math.floor(Math.random() * 100)}`;
          
          // Check if a QR code with this area ID already exists
          const { data: existingQrCodes, error: lookupError } = await supabase
            .from('qr_codes')
            .select('qr_id, qr_value')
            .eq('area_id', areaId)
            .eq('type', 'Shift')
            .limit(1);
          
          if (lookupError) {
            console.error("Error looking up QR code:", lookupError);
          } else if (existingQrCodes && existingQrCodes.length > 0) {
            // Use existing QR code
            console.log("Found existing QR code:", existingQrCodes[0]);
            qrId = existingQrCodes[0].qr_id;
          } else {
            // Create a new QR code in the database if it doesn't exist
            console.log("Creating new QR code for area:", areaId);
            const { data: newQrCode, error: qrInsertError } = await supabase
              .from('qr_codes')
              .insert({
                area_id: areaId,
                area_name: areaName,
                qr_value: qrData,
                type: 'Shift'
              })
              .select('qr_id')
              .single();
            
            if (qrInsertError) {
              console.error("Error creating QR code:", qrInsertError);
            } else if (newQrCode) {
              qrId = newQrCode.qr_id;
              console.log("Created new QR code with ID:", qrId);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing QR data:", e);
        // For simulation, create a random area if parsing fails
        areaId = `simulated-area-${Math.random().toString(36).substring(2, 10)}`;
        areaName = `Simulated Area ${Math.floor(Math.random() * 100)}`;
        
        // Create a new QR code for the simulation
        const { data: newQrCode, error: qrError } = await supabase
          .from('qr_codes')
          .insert({
            area_id: areaId,
            area_name: areaName,
            qr_value: JSON.stringify({
              areaId: areaId,
              areaName: areaName,
              type: 'Shift',
              timestamp: Date.now()
            }),
            type: 'Shift'
          })
          .select('qr_id')
          .single();
        
        if (qrError) {
          console.error("Error creating simulated QR code:", qrError);
        } else if (newQrCode) {
          qrId = newQrCode.qr_id;
          console.log("Created simulated QR code with ID:", qrId);
        }
      }
      
      // Create a proper UUID for the user ID (in a real app, get this from auth)
      const temporaryUserId = uuidv4();
      
      // Store the shift in the database
      console.log("Inserting shift with user ID:", temporaryUserId, "and QR ID:", qrId);
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
          description: "Failed to start shift. Database error: " + error.message,
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
    } catch (error: any) {
      console.error("Error in startShift:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
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
