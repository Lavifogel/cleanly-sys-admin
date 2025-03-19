
import { useState, useEffect } from "react";
import { useShiftState } from "./useShiftState";
import { useShiftActions } from "./useShiftActions";
import { useShiftTimer } from "./useShiftTimer"; // Fixed import path
import { getActiveShiftForUser, getShiftHistoryForUser } from "@/hooks/activityLogs/useActivityLogService";

export function useShift() {
  // Initialize state
  const {
    activeShift,
    setActiveShift,
    elapsedTime,
    setElapsedTime,
    shiftsHistory,
    setShiftsHistory
  } = useShiftState();

  // Initialize actions
  const {
    startShift,
    endShift,
    autoEndShift
  } = useShiftActions(
    activeShift,
    elapsedTime,
    shiftsHistory,
    setActiveShift,
    setElapsedTime,
    setShiftsHistory
  );

  // Set up timer
  useShiftTimer(activeShift, setElapsedTime);

  // Load shift from activity logs when component mounts
  useEffect(() => {
    const fetchShiftData = async () => {
      try {
        // Load active shift from activity logs
        const userId = localStorage.getItem('tempUserId') || '245eaddd-0db7-4fd0-9eee-80d679dd01a1'; // Default mock user ID
        const activeShiftData = await getActiveShiftForUser(userId);
        
        if (activeShiftData) {
          setActiveShift({
            id: activeShiftData.id,
            startTime: activeShiftData.startTime,
            location: activeShiftData.location || "Unknown Location",
            qrId: activeShiftData.qrId,
            timer: 0
          });
          
          // Calculate elapsed time since shift started
          const now = new Date();
          const elapsedMs = now.getTime() - activeShiftData.startTime.getTime();
          setElapsedTime(Math.floor(elapsedMs / 1000));
        }
        
        // Load shift history
        const shiftHistory = await getShiftHistoryForUser(userId);
        if (shiftHistory && shiftHistory.length > 0) {
          setShiftsHistory(shiftHistory);
        }
      } catch (error) {
        console.error("Error loading shift data:", error);
      }
    };
    
    fetchShiftData();
  }, [setActiveShift, setElapsedTime, setShiftsHistory]);

  return {
    // State
    activeShift,
    elapsedTime,
    shiftsHistory,
    
    // Actions
    startShift,
    endShift,
    autoEndShift
  };
}

export * from "./types";
