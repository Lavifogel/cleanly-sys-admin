
/**
 * Parse QR code data to extract area information
 */
export function parseQrData(qrData: string) {
  try {
    console.log("Attempting to parse QR data:", qrData);
    
    // Try parsing as JSON
    let qrDataObj;
    try {
      qrDataObj = JSON.parse(qrData);
      console.log("Parsed JSON data:", qrDataObj);
    } catch (parseError) {
      console.log("Not valid JSON, trying URL parameters");
      // If not JSON, try parsing as URL parameters
      const params = new URLSearchParams(qrData);
      if (params.has('areaId') || params.has('location')) {
        qrDataObj = {
          areaId: params.get('areaId') || params.get('location'),
          areaName: params.get('areaName') || params.get('locationName') || params.get('location')
        };
        console.log("Parsed URL params:", qrDataObj);
      } else {
        // If not URL params, use as plain text
        console.log("Using as plain text");
        qrDataObj = {
          areaId: qrData,
          areaName: `Area from ${qrData}`
        };
      }
    }
    
    if (qrDataObj && (qrDataObj.areaId || qrDataObj.locationId)) {
      return {
        areaId: qrDataObj.areaId || qrDataObj.locationId,
        areaName: qrDataObj.areaName || qrDataObj.locationName || `Area ${Math.floor(Math.random() * 100)}`,
        isValid: true
      };
    } else {
      console.error("Invalid QR data structure:", qrDataObj);
    }
  } catch (e) {
    console.error("Error parsing QR data:", e);
  }
  
  // Fallback for simulation or invalid data
  const randomId = Math.random().toString(36).substring(2, 10);
  return {
    areaId: `simulated-area-${randomId}`,
    areaName: `Simulated Area ${Math.floor(Math.random() * 100)}`,
    isValid: false
  };
}

/**
 * Create a mock QR code data object for simulation
 */
export function createMockQrData(areaId: string, areaName: string, type = 'Shift') {
  const mockData = {
    areaId: areaId,
    areaName: areaName,
    type: type,
    timestamp: Date.now()
  };
  
  console.log("Created mock QR data:", mockData);
  return JSON.stringify(mockData);
}
