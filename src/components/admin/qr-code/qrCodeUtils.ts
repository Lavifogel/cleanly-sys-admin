
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { QrCodeData, SaveQrCodeParams, QrCode } from "@/types/qrCode";

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
  const { areaName, type, areaId, qrCodeImageUrl, description, floor, building } = params;
  
  console.log("Attempting to insert QR code into database...");
  
  // Insert into area table (previously named qr_codes)
  const { data, error } = await supabase
    .from('area')
    .insert({
      area_name: areaName,
      type: type,
      area_id: areaId,
      qr_code_image_url: qrCodeImageUrl,
      description: description,
      floor: floor,
      building: building
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
    description: data.description,
    floor: data.floor,
    building: data.building,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

/**
 * Fetches QR codes from database
 */
export const fetchQrCodes = async (): Promise<QrCode[]> => {
  const { data, error } = await supabase
    .from('area')
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
    description: qr.description,
    floor: qr.floor,
    building: qr.building,
    createdAt: qr.created_at,
    updatedAt: qr.updated_at
  }));
};

/**
 * Updates area details
 */
export const updateArea = async (area: Partial<QrCode> & { areaId: string }): Promise<QrCode> => {
  const { data, error } = await supabase
    .from('area')
    .update({
      area_name: area.areaName,
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
    areaName: data.area_name,
    type: data.type,
    qrCodeImageUrl: data.qr_code_image_url,
    description: data.description,
    floor: data.floor,
    building: data.building,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
