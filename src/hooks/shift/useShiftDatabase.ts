
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates or finds an existing QR code in the database
 */
export async function createOrFindQrCode(areaId: string, areaName: string, qrData: string) {
  console.log("Creating or finding QR code for area:", areaId, areaName);
  
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
    
    console.log("Created new QR code:", newQrCode);
    return newQrCode.qr_id;
  }
}

/**
 * Creates a new shift in the database
 */
export async function createShift(shiftId: string, userId: string, startTime: string, qrId: string | null) {
  // Get or create a proper UUID for the user
  const properUserId = await getOrCreateUserUUID(userId);
  
  console.log("Creating shift with ID:", shiftId, "for user:", properUserId, "QR ID:", qrId);
  
  // Use the field name start_qr_id instead of qr_id to match the database schema
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      id: shiftId,
      user_id: properUserId,
      start_time: startTime,
      status: 'active',
      start_qr_id: qrId // Use the correct field name for the QR code ID
    });
  
  if (error) {
    console.error("Error storing shift:", error);
    throw new Error(`Failed to store shift: ${error.message}`);
  }
  
  console.log("Shift created successfully");
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
 * Returns the user ID for Lavi Fogel, generating a valid UUID if needed
 */
export function generateTemporaryUserId() {
  // Use a consistent UUID for Lavi Fogel
  const laviUserIdInfo = "lavi-fogel-972527868115";
  
  // First check if this user already exists in the database
  // This will convert the string ID to a proper UUID if needed
  return getOrCreateUserUUID(laviUserIdInfo).catch(err => {
    console.error("Error ensuring user exists:", err);
    // Fallback to a random UUID if there's an error
    return uuidv4();
  });
}

/**
 * Creates or finds the user in the database and returns a proper UUID
 */
async function getOrCreateUserUUID(userIdInfo: string): Promise<string> {
  // First check if we already have a mapping for this user ID
  const { data: existingMapping, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('phone', userIdInfo)
    .limit(1);
  
  if (lookupError) {
    console.error("Error looking up user mapping:", lookupError);
    throw new Error(`Failed to lookup user: ${lookupError.message}`);
  }
  
  if (existingMapping && existingMapping.length > 0) {
    // User already exists, return their UUID
    console.log("Found existing user UUID:", existingMapping[0].id);
    return existingMapping[0].id;
  } else {
    // Create a new user with a proper UUID
    const newUUID = uuidv4();
    console.log("Generated new UUID for user:", newUUID);
    
    // Create the user entry
    const { data: newUser, error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: newUUID,
        first_name: "Lavi",
        last_name: "Fogel",
        phone: userIdInfo,
        role: "cleaner",
        start_date: "2023-03-14",
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
    
    console.log("Created new user with UUID:", newUser.id);
    return newUser.id;
  }
}
