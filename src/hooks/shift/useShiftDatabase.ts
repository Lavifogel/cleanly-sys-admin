
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates or finds an existing QR code in the database
 */
export async function createOrFindQrCode(areaId: string, areaName: string, qrData: string) {
  // Check if a QR code with this area ID already exists
  const { data: existingQrCodes, error: lookupError } = await supabase
    .from('qr_codes')
    .select('qr_id, qr_value')
    .eq('area_id', areaId)
    .eq('type', 'Shift')
    .limit(1);
  
  if (lookupError) {
    console.error("Error looking up QR code:", lookupError);
    throw new Error(`Failed to lookup QR code: ${lookupError.message}`);
  }
  
  if (existingQrCodes && existingQrCodes.length > 0) {
    // Use existing QR code
    console.log("Found existing QR code:", existingQrCodes[0]);
    return existingQrCodes[0].qr_id;
  } else {
    // Create a new QR code in the database
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
      throw new Error(`Failed to create QR code: ${qrInsertError.message}`);
    }
    
    if (!newQrCode) {
      throw new Error("Failed to create QR code: No data returned");
    }
    
    return newQrCode.qr_id;
  }
}

/**
 * Creates a new shift in the database
 */
export async function createShift(shiftId: string, userId: string, startTime: string, qrId: string | null) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      id: shiftId,
      user_id: userId,
      start_time: startTime,
      status: 'active',
      qr_id: qrId
    });
  
  if (error) {
    console.error("Error storing shift:", error);
    throw new Error(`Failed to store shift: ${error.message}`);
  }
  
  return data;
}

/**
 * Updates a shift in the database when it ends
 */
export async function updateShiftEnd(shiftId: string, endTime: string, status: string) {
  const { error } = await supabase
    .from('shifts')
    .update({
      end_time: endTime,
      status: status
    })
    .eq('id', shiftId);
  
  if (error) {
    console.error("Error updating shift:", error);
    throw new Error(`Failed to end shift: ${error.message}`);
  }
  
  return true;
}

/**
 * Generates a temporary user ID (in a real app, this would come from authentication)
 */
export function generateTemporaryUserId() {
  return uuidv4();
}
