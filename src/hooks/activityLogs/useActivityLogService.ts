
import { supabase } from "@/integrations/supabase/client";
import { 
  ActivityLog, 
  ActivityType,
  CreateActivityLogParams,
  ActivityLogRequest
} from "@/types/activityLog";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new activity log record
 */
export async function createActivityLog(request: ActivityLogRequest): Promise<ActivityLog> {
  console.log("Creating activity log:", request);
  
  // Prepare the data
  const activityData = {
    ...request,
    id: uuidv4(), // Generate UUID here since it's not in the request
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    end_time: request.end_time || null
  };
  
  // Create the activity log
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(activityData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating activity log:", error);
    throw new Error(`Failed to create activity log: ${error.message}`);
  }
  
  return data as ActivityLog;
}

/**
 * Updates an existing activity log record
 */
export async function updateActivityLog(id: string, updates: Partial<ActivityLogRequest>): Promise<ActivityLog> {
  console.log(`Updating activity log ${id}:`, updates);
  
  // Prepare the update data
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  // Update the activity log
  const { data, error } = await supabase
    .from('activity_logs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating activity log:", error);
    throw new Error(`Failed to update activity log: ${error.message}`);
  }
  
  return data as ActivityLog;
}

/**
 * Fetches a single activity log by ID
 */
export async function getActivityLog(id: string): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching activity log:", error);
    throw new Error(`Failed to fetch activity log: ${error.message}`);
  }
  
  return data as ActivityLog;
}

/**
 * Gets an activity log by ID
 */
export async function getActivityLogById(id: string): Promise<ActivityLog | null> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error(`Error fetching activity log: ${id}`, error);
    throw new Error(`Failed to fetch activity log: ${error.message}`);
  }
  
  return data as ActivityLog;
}

/**
 * Gets active shift for a user by looking for the most recent shift_start activity 
 * without a corresponding shift_end
 */
export async function getActiveShiftForUser(userId: string) {
  // First find the most recent shift_start activity
  const { data: shiftStarts, error: shiftStartError } = await supabase
    .from('activity_logs')
    .select(`
      *,
      qr_codes (
        area_name
      )
    `)
    .eq('user_id', userId)
    .eq('activity_type', 'shift_start')
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1);
    
  if (shiftStartError) {
    console.error("Error fetching active shift:", shiftStartError);
    throw new Error(`Failed to fetch active shift: ${shiftStartError.message}`);
  }
  
  if (!shiftStarts || shiftStarts.length === 0) {
    return null; // No active shift found
  }
  
  const shiftStart = shiftStarts[0];
  
  // Check if there's a corresponding shift_end activity
  const { data: shiftEnds, error: shiftEndError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('related_id', shiftStart.id)
    .eq('activity_type', 'shift_end')
    .limit(1);
    
  if (shiftEndError) {
    console.error("Error checking for shift end:", shiftEndError);
    throw new Error(`Failed to check for shift end: ${shiftEndError.message}`);
  }
  
  if (shiftEnds && shiftEnds.length > 0) {
    return null; // Shift has been ended
  }
  
  // Return the active shift
  return {
    id: shiftStart.id,
    qrId: shiftStart.qr_id,
    startTime: new Date(shiftStart.start_time),
    userId: shiftStart.user_id,
    status: shiftStart.status,
    location: shiftStart.qr_codes?.area_name
  };
}

/**
 * Gets active cleaning for a shift by looking for the most recent cleaning_start activity 
 * without a corresponding cleaning_end
 */
export async function getActiveCleaningForShift(shiftId: string) {
  // First find the most recent cleaning_start activity
  const { data: cleaningStarts, error: cleaningStartError } = await supabase
    .from('activity_logs')
    .select(`
      *,
      qr_codes (
        area_name
      )
    `)
    .eq('related_id', shiftId)
    .eq('activity_type', 'cleaning_start')
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1);
    
  if (cleaningStartError) {
    console.error("Error fetching active cleaning:", cleaningStartError);
    throw new Error(`Failed to fetch active cleaning: ${cleaningStartError.message}`);
  }
  
  if (!cleaningStarts || cleaningStarts.length === 0) {
    return null; // No active cleaning found
  }
  
  const cleaningStart = cleaningStarts[0];
  
  // Check if there's a corresponding cleaning_end activity
  const { data: cleaningEnds, error: cleaningEndError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('related_id', cleaningStart.id)
    .eq('activity_type', 'cleaning_end')
    .limit(1);
    
  if (cleaningEndError) {
    console.error("Error checking for cleaning end:", cleaningEndError);
    throw new Error(`Failed to check for cleaning end: ${cleaningEndError.message}`);
  }
  
  if (cleaningEnds && cleaningEnds.length > 0) {
    return null; // Cleaning has been ended
  }
  
  // Return the active cleaning
  return {
    id: cleaningStart.id,
    shiftId: cleaningStart.related_id || '',
    qrId: cleaningStart.qr_id,
    startTime: new Date(cleaningStart.start_time),
    userId: cleaningStart.user_id,
    status: cleaningStart.status,
    location: cleaningStart.qr_codes?.area_name || 'Unknown Location',
    notes: cleaningStart.notes,
    paused: cleaningStart.status === 'paused'
  };
}

/**
 * Gets shift history for a user
 */
export async function getShiftHistoryForUser(userId: string) {
  // Get all shift_start activities for the user
  const { data: shiftStarts, error: shiftStartError } = await supabase
    .from('activity_logs')
    .select(`
      id,
      user_id,
      qr_id,
      activity_type,
      start_time,
      status,
      qr_codes (
        area_name
      )
    `)
    .eq('user_id', userId)
    .eq('activity_type', 'shift_start')
    .order('start_time', { ascending: false });
    
  if (shiftStartError) {
    console.error("Error fetching shift history:", shiftStartError);
    throw new Error(`Failed to fetch shift history: ${shiftStartError.message}`);
  }
  
  if (!shiftStarts || shiftStarts.length === 0) {
    return []; // No shifts found
  }
  
  // For each shift_start, get the corresponding shift_end
  const shiftHistory = await Promise.all(shiftStarts.map(async (shiftStart) => {
    // Get corresponding shift_end
    const { data: shiftEnds, error: shiftEndError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('related_id', shiftStart.id)
      .eq('activity_type', 'shift_end')
      .limit(1);
      
    if (shiftEndError) {
      console.error(`Error fetching shift end for ${shiftStart.id}:`, shiftEndError);
      throw new Error(`Failed to fetch shift end: ${shiftEndError.message}`);
    }
    
    const shiftEnd = shiftEnds && shiftEnds.length > 0 ? shiftEnds[0] : null;
    
    // Count cleanings for this shift
    const { count: cleaningsCount, error: cleaningsError } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .eq('related_id', shiftStart.id)
      .eq('activity_type', 'cleaning_start');
      
    if (cleaningsError) {
      console.error(`Error counting cleanings for shift ${shiftStart.id}:`, cleaningsError);
      throw new Error(`Failed to count cleanings: ${cleaningsError.message}`);
    }
    
    const startTime = new Date(shiftStart.start_time);
    const endTime = shiftEnd ? new Date(shiftEnd.start_time) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    let duration = "";
    
    if (durationMinutes < 60) {
      duration = `${durationMinutes}m`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      duration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    
    return {
      id: shiftStart.id,
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: shiftEnd ? endTime.toTimeString().slice(0, 5) : null,
      duration: duration,
      status: shiftEnd ? shiftEnd.status : shiftStart.status,
      cleanings: cleaningsCount || 0
    };
  }));
  
  return shiftHistory;
}

/**
 * Gets cleaning history for a shift
 */
export async function getCleaningHistoryForShift(shiftId: string) {
  // Get all cleaning_start activities for the shift
  const { data: cleaningStarts, error: cleaningStartError } = await supabase
    .from('activity_logs')
    .select(`
      id,
      user_id,
      qr_id,
      activity_type,
      start_time,
      status,
      notes,
      related_id,
      qr_codes (
        area_name
      )
    `)
    .eq('related_id', shiftId)
    .eq('activity_type', 'cleaning_start')
    .order('start_time', { ascending: false });
    
  if (cleaningStartError) {
    console.error("Error fetching cleaning history:", cleaningStartError);
    throw new Error(`Failed to fetch cleaning history: ${cleaningStartError.message}`);
  }
  
  if (!cleaningStarts || cleaningStarts.length === 0) {
    return []; // No cleanings found
  }
  
  // For each cleaning_start, get the corresponding cleaning_end
  const cleaningHistory = await Promise.all(cleaningStarts.map(async (cleaningStart) => {
    // Get corresponding cleaning_end
    const { data: cleaningEnds, error: cleaningEndError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('related_id', cleaningStart.id)
      .eq('activity_type', 'cleaning_end')
      .limit(1);
      
    if (cleaningEndError) {
      console.error(`Error fetching cleaning end for ${cleaningStart.id}:`, cleaningEndError);
      throw new Error(`Failed to fetch cleaning end: ${cleaningEndError.message}`);
    }
    
    const cleaningEnd = cleaningEnds && cleaningEnds.length > 0 ? cleaningEnds[0] : null;
    
    // Get images for this cleaning
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('image_url')
      .eq('activity_log_id', cleaningStart.id);
      
    if (imagesError) {
      console.error(`Error fetching images for cleaning ${cleaningStart.id}:`, imagesError);
      throw new Error(`Failed to fetch images: ${imagesError.message}`);
    }
    
    const startTime = new Date(cleaningStart.start_time);
    const endTime = cleaningEnd ? new Date(cleaningEnd.start_time) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    return {
      id: cleaningStart.id,
      location: cleaningStart.qr_codes?.area_name || "Unknown Location",
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: cleaningEnd ? endTime.toTimeString().slice(0, 5) : null,
      duration: `${durationMinutes}m`,
      status: cleaningEnd ? cleaningEnd.status : cleaningStart.status,
      notes: cleaningStart.notes || "",
      images: images ? images.length : 0,
      shiftId: cleaningStart.related_id,
      imageUrls: images ? images.map(img => img.image_url) : []
    };
  }));
  
  return cleaningHistory;
}

/**
 * Saves images for a cleaning activity
 */
export async function saveImagesForCleaning(cleaningId: string, imageUrls: string[]): Promise<boolean> {
  console.log(`Saving ${imageUrls.length} images for cleaning ${cleaningId}`);
  
  if (!cleaningId || imageUrls.length === 0) {
    console.log("No cleaning ID or images to save");
    return false;
  }
  
  try {
    // Generate UUIDs for the images
    const imagesToInsert = imageUrls.map(url => ({
      id: uuidv4(),
      activity_log_id: cleaningId,
      cleaning_id: cleaningId,
      image_url: url
    }));
    
    // Insert the images
    const { error } = await supabase
      .from('images')
      .insert(imagesToInsert);
    
    if (error) {
      console.error("Error inserting images:", error);
      throw error;
    }
    
    console.log(`Successfully saved ${imageUrls.length} images for cleaning ${cleaningId}`);
    return true;
  } catch (error) {
    console.error("Error saving images:", error);
    return false;
  }
}
