
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const startShift = (qrData: string) => {
    const newShiftId = `shift-${Date.now()}`;
    
    setActiveShift({
      startTime: new Date(),
      timer: 0,
      id: newShiftId,
    });
    setElapsedTime(0);
  };

  // Handle endShift
  const endShift = (withScan: boolean, qrData?: string) => {
    const newShift = {
      id: (shiftsHistory.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: activeShift!.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
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
