
import { useState, useEffect } from "react";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { formatTime } from "@/utils/timeUtils";
import { supabase } from "@/integrations/supabase/client";

export function useCleaningState(activeShiftId: string | undefined) {
  // Core cleaning state
  const [activeCleaning, setActiveCleaning] = useState<null | Cleaning>(null);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
  
  // Summary related state
  const [cleaningSummary, setCleaningSummary] = useState<CleaningSummary>({
    location: "",
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
    images: []
  });
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  
  // Format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Initial cleaning history
  const [cleaningsHistory, setCleaningsHistory] = useState<CleaningHistoryItem[]>([
    {
      id: "1",
      location: "Conference Room A",
      date: "15/08/2023", // Changed to DD/MM/YYYY format
      startTime: "09:30",
      endTime: "10:05",
      duration: "35m",
      status: "finished with scan",
      images: 2,
      notes: "Cleaned and restocked supplies",
      shiftId: "previous-shift-1",
      imageUrls: [
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage1.jpg",
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage2.jpg"
      ]
    },
    {
      id: "2",
      location: "Main Office",
      date: "15/08/2023", // Changed to DD/MM/YYYY format
      startTime: "10:30",
      endTime: "11:12",
      duration: "42m",
      status: "finished without scan",
      images: 0,
      notes: "",
      shiftId: "previous-shift-1",
    },
  ]);

  // Load active cleaning from localStorage on component mount
  useEffect(() => {
    const storedCleaningData = localStorage.getItem('activeCleaning');
    const storedCleaningTimer = localStorage.getItem('cleaningTimer');
    const storedCleaningStartTime = localStorage.getItem('cleaningStartTime');
    
    if (storedCleaningData && storedCleaningStartTime) {
      try {
        const cleaningData = JSON.parse(storedCleaningData);
        const startTime = new Date(storedCleaningStartTime);
        const isPaused = localStorage.getItem('cleaningPaused') === 'true';
        
        // Only restore if the shift matches
        if (activeShiftId && cleaningData.shiftId === activeShiftId) {
          const savedCleaning: Cleaning = {
            id: cleaningData.id,
            location: cleaningData.location,
            startTime,
            timer: 0,
            paused: isPaused
          };
          
          setActiveCleaning(savedCleaning);
          
          if (storedCleaningTimer) {
            setCleaningElapsedTime(parseInt(storedCleaningTimer, 10));
          }
        }
      } catch (error) {
        console.error("Error parsing stored cleaning data:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('activeCleaning');
        localStorage.removeItem('cleaningTimer');
        localStorage.removeItem('cleaningStartTime');
        localStorage.removeItem('cleaningPaused');
      }
    }
  }, [activeShiftId]);

  // Save active cleaning to localStorage whenever it changes
  useEffect(() => {
    if (activeCleaning && activeShiftId) {
      localStorage.setItem('activeCleaning', JSON.stringify({
        id: activeCleaning.id,
        location: activeCleaning.location,
        shiftId: activeShiftId
      }));
      localStorage.setItem('cleaningStartTime', activeCleaning.startTime.toISOString());
      localStorage.setItem('cleaningPaused', activeCleaning.paused ? 'true' : 'false');
    } else {
      localStorage.removeItem('activeCleaning');
      localStorage.removeItem('cleaningStartTime');
      localStorage.removeItem('cleaningPaused');
    }
  }, [activeCleaning, activeShiftId]);

  // Save cleaning elapsed time when it changes
  useEffect(() => {
    if (activeCleaning && cleaningElapsedTime > 0) {
      localStorage.setItem('cleaningTimer', cleaningElapsedTime.toString());
    } else if (!activeCleaning) {
      localStorage.removeItem('cleaningTimer');
    }
  }, [activeCleaning, cleaningElapsedTime]);

  // Fetch cleaning history when shift changes
  useEffect(() => {
    const fetchCleaningHistory = async () => {
      if (!activeShiftId) return;
      
      try {
        const { data, error } = await supabase
          .from('cleanings')
          .select(`
            id, 
            shift_id, 
            qr_id, 
            start_time, 
            end_time, 
            status, 
            notes,
            qr_codes(area_name)
          `)
          .eq('shift_id', activeShiftId)
          .order('start_time', { ascending: false });
        
        if (error) {
          console.error("Error fetching cleanings:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Process the cleaning data
          const historyItems: CleaningHistoryItem[] = await Promise.all(data.map(async (cleaning) => {
            // Get images for this cleaning
            const { data: images } = await supabase
              .from('images')
              .select('image_url')
              .eq('cleaning_id', cleaning.id);
            
            const startTime = new Date(cleaning.start_time || '');
            const endTime = cleaning.end_time ? new Date(cleaning.end_time) : new Date();
            
            const startTimeStr = startTime.toTimeString().slice(0, 5);
            const endTimeStr = cleaning.end_time ? endTime.toTimeString().slice(0, 5) : "--:--";
            
            // Calculate duration
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMinutes = Math.floor(durationMs / (1000 * 60));
            
            return {
              id: cleaning.id,
              location: cleaning.qr_codes?.area_name || "Unknown Location",
              date: formatDateToDDMMYYYY(cleaning.start_time || ''),
              startTime: startTimeStr,
              endTime: endTimeStr,
              duration: `${durationMinutes}m`,
              status: cleaning.status,
              images: images?.length || 0,
              notes: cleaning.notes || "",
              shiftId: cleaning.shift_id,
              imageUrls: images?.map(img => img.image_url) || []
            };
          }));
          
          // Update state with real data
          if (historyItems.length > 0) {
            setCleaningsHistory(historyItems);
          }
        }
      } catch (err) {
        console.error("Error processing cleaning history:", err);
      }
    };
    
    fetchCleaningHistory();
  }, [activeShiftId]);

  return {
    // State
    activeCleaning,
    setActiveCleaning,
    cleaningElapsedTime,
    setCleaningElapsedTime,
    cleaningSummary,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary,
    cleaningsHistory,
    setCleaningsHistory,
    
    // Utility functions
    formatCleaningDuration: () => formatTime(cleaningElapsedTime)
  };
}
