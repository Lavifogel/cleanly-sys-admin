
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
      
      // Check if it's a URL
      if (qrData.includes('http') && qrData.includes('?')) {
        try {
          // Extract query parameters from URL
          const url = new URL(qrData);
          const params = url.searchParams;
          
          if (params.has('areaId') || params.has('location')) {
            qrDataObj = {
              areaId: params.get('areaId') || params.get('location'),
              areaName: params.get('areaName') || params.get('locationName') || params.get('location')
            };
            console.log("Parsed URL query params:", qrDataObj);
          }
        } catch (urlError) {
          console.log("Not a valid URL, continuing with other methods");
        }
      }
      
      // If not a URL or couldn't parse URL params, try as plain URL params
      if (!qrDataObj) {
        const params = new URLSearchParams(qrData);
        if (params.has('areaId') || params.has('location')) {
          qrDataObj = {
            areaId: params.get('areaId') || params.get('location'),
            areaName: params.get('areaName') || params.get('locationName') || params.get('location')
          };
          console.log("Parsed URL params:", qrDataObj);
        }
      }
      
      // If still no object, handle as plain text
      if (!qrDataObj) {
        // Try to extract meaningful data from plain text
        // Trim any whitespace and remove common QR code prefixes
        const cleanedQrData = qrData.trim().replace(/^(http[s]?:\/\/|www\.|data:|SMSTO:|mailto:|tel:)/i, '');
        
        console.log("Using as plain text:", cleanedQrData);
        qrDataObj = {
          areaId: cleanedQrData,
          areaName: `Area from ${cleanedQrData.substring(0, 20)}${cleanedQrData.length > 20 ? '...' : ''}`
        };
      }
    }
    
    // Validate and return the parsed data
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
