
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
 * Creates a new area in the database
 */
export const createArea = async (areaId: string, areaName: string): Promise<any> => {
  const { data, error } = await supabase
    .from('areas')
    .insert({
      area_id: areaId,
      area_name: areaName
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating area:", error);
    throw error;
  }

  return data;
};

/**
 * Saves QR code to database
 */
export const saveQrCode = async (params: SaveQrCodeParams): Promise<QrCode> => {
  const { areaName, type, areaId, qrCodeImageUrl } = params;
  
  console.log("Attempting to insert QR code into database...");
  
  // First, ensure the area exists
  try {
    await createArea(areaId, areaName);
  } catch (error) {
    console.log("Area may already exist, continuing...");
  }
  
  // Then create the QR code
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      qr_value: JSON.stringify({ areaId, areaName, type }),
      area_id: areaId,
      type: type,
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
    id: data.qr_id,
    areaName: areaName,
    type: data.type,
    areaId: data.area_id,
    qrCodeImageUrl: qrCodeImageUrl,
    createdAt: data.created_at
  };
};

/**
 * Fetches QR codes from database
 */
export const fetchQrCodes = async (): Promise<QrCode[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('qr_id, qr_value, area_id, type, created_at, qr_code_image_url, areas(area_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data) return [];
  
  return data.map(qr => ({
    id: qr.qr_id,
    areaName: qr.areas?.area_name || '',
    type: qr.type,
    areaId: qr.area_id || '',
    qrCodeImageUrl: qr.qr_code_image_url || '',
    createdAt: qr.created_at
  }));
};
