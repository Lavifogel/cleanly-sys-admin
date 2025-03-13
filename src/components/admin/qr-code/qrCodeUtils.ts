
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
 * Saves QR code to database using the new unified schema
 */
export const saveQrCode = async (params: SaveQrCodeParams): Promise<QrCode> => {
  const { areaName, type, areaId, qrCodeImageUrl } = params;
  
  console.log("Attempting to insert QR code into database...");
  
  // With the unified schema, we insert directly into qr_codes table
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      area_id: areaId,
      area_name: areaName,
      qr_value: JSON.stringify({ areaId, areaName, type }),
      type: type
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
    areaName: data.area_name,
    type: data.type,
    areaId: data.area_id,
    qrCodeImageUrl: qrCodeImageUrl, // We store this client-side only
    createdAt: data.created_at
  };
};

/**
 * Fetches QR codes from the unified table
 */
export const fetchQrCodes = async (): Promise<QrCode[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data) return [];
  
  return data.map(qr => {
    // Parse QR value for image URL if available, otherwise undefined
    let qrData;
    try {
      qrData = JSON.parse(qr.qr_value);
    } catch (e) {
      qrData = {};
    }
    
    return {
      id: qr.qr_id,
      areaName: qr.area_name,
      type: qr.type,
      areaId: qr.area_id || '',
      // No image URL stored in database, we would need to regenerate it
      qrCodeImageUrl: '',
      createdAt: qr.created_at
    };
  });
};
