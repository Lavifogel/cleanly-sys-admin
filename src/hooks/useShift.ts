
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { 
  createOrFindQrCode, 
  createShift, 
  updateShiftEnd,
  generateTemporaryUserId 
} from "@/hooks/shift/useShiftDatabase";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";
import { getInitialShiftHistory, createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";

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
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>(getInitialShiftHistory());

  // Handle startShift
  const startShift = async (qrData: string) => {
    try {
      const newShiftId = uuidv4();
      const startTime = new Date();
      
      console.log("Starting shift with QR data:", qrData);
      
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);
      
      // If QR data isn't valid, create a mock QR data string
      const qrDataToUse = isValid ? qrData : createMockQrData(areaId, areaName);
      
      // Find or create QR code in database
      let qrId = null;
      try {
        qrId = await createOrFindQrCode(areaId, areaName, qrDataToUse);
        console.log("QR code ID for shift:", qrId);
      } catch (error: any) {
        console.error("Error with QR code:", error);
        toast({
          title: "QR Code Error",
          description: error.message || "There was an issue with the QR code.",
          variant: "destructive",
        });
      }
      
      // Generate a temporary user ID
      const temporaryUserId = await generateTemporaryUserId();
      
      // Store the shift in the database
      try {
        await createShift(newShiftId, temporaryUserId, startTime.toISOString(), qrId);
        console.log("Shift stored successfully");
      } catch (error: any) {
        console.error("Error storing shift:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to start shift. Database error.",
          variant: "destructive",
        });
        return;
      }
      
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
      const status = withScan ? "finished with scan" : "finished without scan";
      
      // Update the shift in the database
      try {
        await updateShiftEnd(activeShift.id, endTime.toISOString(), status);
      } catch (error: any) {
        console.error("Error updating shift:", error);
        toast({
          title: "Error",
          description: "Failed to end shift. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new shift history item
      const newShift = createShiftHistoryItem(
        activeShift.id,
        activeShift.startTime,
        endTime,
        elapsedTime,
        status
      );

      // Update the local state
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
