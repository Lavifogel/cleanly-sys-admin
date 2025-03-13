
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
  const { areaName, type, areaId, qrCodeImageUrl } = params;
  
  console.log("Attempting to insert QR code into database...");
  
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
