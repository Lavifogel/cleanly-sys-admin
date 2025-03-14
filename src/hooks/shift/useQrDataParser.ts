
/**
 * Parse QR code data to extract area information
 */
export function parseQrData(qrData: string) {
  try {
    console.log("Attempting to parse QR data:", qrData);
    const qrDataObj = JSON.parse(qrData);
    console.log("Parsed QR data:", qrDataObj);
    
    if (qrDataObj && qrDataObj.areaId) {
      return {
        areaId: qrDataObj.areaId,
        areaName: qrDataObj.areaName || `Area ${Math.floor(Math.random() * 100)}`,
        isValid: true
      };
    } else {
      console.error("Invalid QR data structure:", qrDataObj);
    }
  } catch (e) {
    console.error("Error parsing QR data:", e);
  }
  
  // Fallback for simulation or invalid data
  return {
    areaId: `simulated-area-${Math.random().toString(36).substring(2, 10)}`,
    areaName: `Simulated Area ${Math.floor(Math.random() * 100)}`,
    isValid: false
  };
}

/**
 * Create a mock QR code data object for simulation
 */
export function createMockQrData(areaId: string, areaName: string) {
  return JSON.stringify({
    areaId: areaId,
    areaName: areaName,
    type: 'Shift',
    timestamp: Date.now()
  });
}
