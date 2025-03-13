
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { QrCodeData, SaveQrCodeParams, QrCode, Area } from "@/types/qrCode";

/**
 * Generates a QR code image as a data URL
 */
export const generateQrCodeDataUrl = async (qrData: QrCodeData): Promise<string> => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

/**
 * Generates an area ID either using the database function or locally
 */
export const generateAreaId = async (areaName: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .rpc('generate_area_id', { area_name: areaName });

    if (error) {
      console.error("Error generating area ID:", error);
      // Fallback to local generation if RPC fails
      return `${areaName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    }

    return data as string;
  } catch (error) {
    console.error("Error in generateAreaId:", error);
    return `${areaName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
  }
};

/**
 * Saves QR code to database
 */
export const saveQrCode = async (params: SaveQrCodeParams): Promise<QrCode> => {
  const { areaName, type, areaId, qrCodeImageUrl } = params;
  
  console.log("Attempting to insert QR code into database...");
  
  // The trigger will automatically create the area, but we have full data here
  // so it's better to explicitly add the area first
  const { error: areaError } = await supabase
    .from('areas')
    .upsert({
      area_id: areaId,
      name: areaName
    }, { onConflict: 'area_id' });
    
  if (areaError) {
    console.error("Error creating area:", areaError);
    throw areaError;
  }
  
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      area_name: areaName,
      type: type,
      area_id: areaId,
      qr_code_image_url: qrCodeImageUrl
    })
    .select()
    .single();

  if (error) {
    console.error("Database error:", error);
    throw error;
  }

  console.log("QR code inserted successfully:", data);
  
  return {
    id: data.id,
    areaName: data.area_name,
    type: data.type,
    areaId: data.area_id,
    qrCodeImageUrl: data.qr_code_image_url,
    createdAt: data.created_at
  };
};

/**
 * Fetches QR codes from database
 */
export const fetchQrCodes = async (): Promise<QrCode[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data) return [];
  
  return data.map(qr => ({
    id: qr.id,
    areaName: qr.area_name,
    type: qr.type,
    areaId: qr.area_id,
    qrCodeImageUrl: qr.qr_code_image_url,
    createdAt: qr.created_at
  }));
};

/**
 * Fetches areas from database
 */
export const fetchAreas = async (): Promise<Area[]> => {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  if (!data) return [];
  
  return data.map(area => ({
    id: area.id,
    areaId: area.area_id,
    name: area.name,
    description: area.description,
    floor: area.floor,
    building: area.building,
    createdAt: area.created_at,
    updatedAt: area.updated_at
  }));
};

/**
 * Updates area details
 */
export const updateArea = async (area: Partial<Area> & { areaId: string }): Promise<Area> => {
  const { data, error } = await supabase
    .from('areas')
    .update({
      name: area.name,
      description: area.description,
      floor: area.floor,
      building: area.building
    })
    .eq('area_id', area.areaId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    areaId: data.area_id,
    name: data.name,
    description: data.description,
    floor: data.floor,
    building: data.building,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
