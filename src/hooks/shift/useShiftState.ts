
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Shift, ShiftHistoryItem } from "./types";
import { getActiveShiftForUser, getShiftHistoryForUser } from "@/hooks/activityLogs/useActivityLogService";
import { generateTemporaryUserId } from "./useShiftDatabase";

export function useShiftState() {
  // Core shift state
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftsHistory, setShiftsHistory] = useState<ShiftHistoryItem[]>([]);

  // Load active shift from localStorage on component mount
  useEffect(() => {
    const storedShiftData = localStorage.getItem('activeShift');
    const storedShiftTimer = localStorage.getItem('shiftTimer');
    const storedShiftStartTime = localStorage.getItem('shiftStartTime');
    
    if (storedShiftData && storedShiftStartTime) {
      try {
        const shiftData = JSON.parse(storedShiftData);
        const startTime = new Date(storedShiftStartTime);
        
        // Create a shift object from stored data
        setActiveShift({
          id: shiftData.id,
          startTime,
          timer: 0,
          location: shiftData.location,
          qrId: shiftData.qrId
        });
        
        if (storedShiftTimer) {
          setElapsedTime(parseInt(storedShiftTimer, 10));
        }
      } catch (error) {
        console.error("Error parsing stored shift data:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('activeShift');
        localStorage.removeItem('shiftTimer');
        localStorage.removeItem('shiftStartTime');
      }
    }
  }, []);

  // Fetch shift history on component mount
  useEffect(() => {
    const fetchShiftHistory = async () => {
      try {
        const userId = await generateTemporaryUserId();
        const history = await getShiftHistoryForUser(userId);
        if (history && history.length > 0) {
          setShiftsHistory(history);
        }
      } catch (error) {
        console.error("Error fetching shift history:", error);
      }
    };
    
    fetchShiftHistory();
  }, []);

  // Save active shift to localStorage whenever it changes
  useEffect(() => {
    if (activeShift) {
      localStorage.setItem('activeShift', JSON.stringify({
        id: activeShift.id,
        location: activeShift.location,
        qrId: activeShift.qrId
      }));
      localStorage.setItem('shiftStartTime', activeShift.startTime.toISOString());
    } else {
      localStorage.removeItem('activeShift');
      localStorage.removeItem('shiftStartTime');
    }
  }, [activeShift]);

  // Save shift elapsed time when it changes
  useEffect(() => {
    if (activeShift && elapsedTime > 0) {
      localStorage.setItem('shiftTimer', elapsedTime.toString());
    } else if (!activeShift) {
      localStorage.removeItem('shiftTimer');
    }
  }, [activeShift, elapsedTime]);

  return {
    activeShift,
    setActiveShift,
    elapsedTime,
    setElapsedTime,
    shiftsHistory,
    setShiftsHistory
  };
}
