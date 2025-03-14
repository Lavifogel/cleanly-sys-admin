
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates or finds an existing QR code in the database for a cleaning
 */
export async function createOrFindCleaningQrCode(areaId: string, areaName: string, qrData: string) {
  console.log("Creating or finding QR code for cleaning area:", areaId, areaName);
  
  // Check if a QR code with this area ID already exists
  const { data: existingQrCodes, error: lookupError } = await supabase
    .from('qr_codes')
    .select('qr_id, qr_value')
    .eq('area_id', areaId)
    .eq('type', 'Cleaning')
    .limit(1);
  
  if (lookupError) {
    console.error("Error looking up cleaning QR code:", lookupError);
    throw new Error(`Failed to lookup cleaning QR code: ${lookupError.message}`);
  }
  
  if (existingQrCodes && existingQrCodes.length > 0) {
    // Use existing QR code
    console.log("Found existing cleaning QR code:", existingQrCodes[0]);
    return existingQrCodes[0].qr_id;
  } else {
    // Create a new QR code in the database
    console.log("Creating new cleaning QR code for area:", areaId);
    const { data: newQrCode, error: qrInsertError } = await supabase
      .from('qr_codes')
      .insert({
        area_id: areaId,
        area_name: areaName,
        qr_value: qrData,
        type: 'Cleaning'
      })
      .select('qr_id')
      .single();
    
    if (qrInsertError) {
      console.error("Error creating cleaning QR code:", qrInsertError);
      throw new Error(`Failed to create cleaning QR code: ${qrInsertError.message}`);
    }
    
    if (!newQrCode) {
      throw new Error("Failed to create cleaning QR code: No data returned");
    }
    
    console.log("Created new cleaning QR code:", newQrCode);
    return newQrCode.qr_id;
  }
}

/**
 * Creates a new cleaning in the database
 */
export async function createCleaning(cleaningId: string, shiftId: string, startTime: string, qrId: string | null, location: string) {
  console.log("Creating cleaning with ID:", cleaningId, "for shift:", shiftId, "QR ID:", qrId);
  
  const { data, error } = await supabase
    .from('cleanings')
    .insert({
      id: cleaningId,
      shift_id: shiftId,
      start_time: startTime,
      status: 'active',
      qr_id: qrId,
      notes: `Location: ${location}`
    });
  
  if (error) {
    console.error("Error storing cleaning:", error);
    throw new Error(`Failed to store cleaning: ${error.message}`);
  }
  
  console.log("Cleaning created successfully");
  return data;
}

/**
 * Updates a cleaning in the database when it ends
 */
export async function updateCleaningEnd(cleaningId: string, endTime: string, status: string, notes: string) {
  const { error } = await supabase
    .from('cleanings')
    .update({
      end_time: endTime,
      status: status,
      notes: notes
    })
    .eq('id', cleaningId);
  
  if (error) {
    console.error("Error updating cleaning:", error);
    throw new Error(`Failed to end cleaning: ${error.message}`);
  }
  
  return true;
}

/**
 * Saves cleaning images to the database
 */
export async function saveCleaningImages(cleaningId: string, imageUrls: string[]) {
  if (!imageUrls.length) return [];
  
  const imagesToInsert = imageUrls.map(url => ({
    id: uuidv4(),
    cleaning_id: cleaningId,
    image_url: url
  }));
  
  const { data, error } = await supabase
    .from('images')
    .insert(imagesToInsert)
    .select();
  
  if (error) {
    console.error("Error storing cleaning images:", error);
    throw new Error(`Failed to store cleaning images: ${error.message}`);
  }
  
  console.log("Cleaning images saved successfully:", data);
  return data;
}
