
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
 * Returns the fixed user ID for Lavi Fogel
 */
export function generateTemporaryUserId() {
  // Fixed ID for Lavi Fogel from the image
  // Using a consistent ID for this specific user
  const laviUserId = "lavi-fogel-972527868115";
  
  // First check if this user already exists in the database
  createOrFindUser(laviUserId).catch(err => {
    console.error("Error ensuring user exists:", err);
  });
  
  return laviUserId;
}

/**
 * Creates or finds the user in the database
 */
async function createOrFindUser(userId: string) {
  // Check if user already exists
  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .limit(1);
  
  if (lookupError) {
    console.error("Error looking up user:", lookupError);
    throw new Error(`Failed to lookup user: ${lookupError.message}`);
  }
  
  if (existingUser && existingUser.length > 0) {
    // User already exists
    console.log("Found existing user:", existingUser[0]);
    return existingUser[0].id;
  } else {
    // Create a new user in the database (from the image provided)
    const { data: newUser, error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        first_name: "Lavi",
        last_name: "Fogel",
        phone: "+972527868115",
        role: "cleaner",
        start_date: "2025-03-14",
        active: true,
        email: "lavi.fogel@example.com" // Added required email field
      })
      .select('id')
      .single();
    
    if (userInsertError) {
      console.error("Error creating user:", userInsertError);
      throw new Error(`Failed to create user: ${userInsertError.message}`);
    }
    
    if (!newUser) {
      throw new Error("Failed to create user: No data returned");
    }
    
    console.log("Created new user:", newUser);
    return newUser.id;
  }
}
