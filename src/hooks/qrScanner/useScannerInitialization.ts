
import { useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseScannerInitializationProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  scannerContainerId: string;
  stopCamera: () => Promise<void>;
  setIsScanning: (value: boolean) => void;
  setError: (error: string | null) => void;
  setCameraActive: (value: boolean) => void;
  mountedRef: React.MutableRefObject<boolean>;
  onScanSuccess: (decodedText: string) => void;
}

export const useScannerInitialization = ({
  scannerRef,
  scannerContainerId,
  stopCamera,
  setIsScanning,
  setError,
  setCameraActive,
  mountedRef,
  onScanSuccess
}: UseScannerInitializationProps) => {
  
  // Validates the scanner container to ensure it exists and has sufficient dimensions
  const validateScannerContainer = useCallback(async (): Promise<boolean> => {
    const containerElement = document.getElementById(scannerContainerId);
    if (!containerElement) {
      throw new Error("Scanner container element not found");
    }
    
    // Log container dimensions to help debug
    const rect = containerElement.getBoundingClientRect();
    console.log("Scanner container dimensions:", rect.width, rect.height);
    
    if (rect.width < 10 || rect.height < 10) {
      console.log("Container has insufficient dimensions, adding delay");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again after delay
      if (!mountedRef.current) return false;
      
      const updatedRect = containerElement.getBoundingClientRect();
      if (updatedRect.width < 10 || updatedRect.height < 10) {
        throw new Error("Scanner container has insufficient dimensions");
      }
    }
    
    return true;
  }, [scannerContainerId, mountedRef]);
  
  // Create scanner configuration
  const createScannerConfig = useCallback(() => {
    return {
      fps: 10, // Lower FPS for more stability
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: ["QR_CODE"],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };
  }, []);
  
  // Setup QR code success callback
  const setupQRCodeCallback = useCallback((onSuccess: (decodedText: string) => void, stopFn: () => Promise<void>) => {
    return (decodedText: string) => {
      console.log("Successfully scanned QR code:", decodedText);
      // Handle the scanned code here
      onSuccess(decodedText);
      
      // Stop scanning after successful scan
      stopFn();
    };
  }, []);
  
  return {
    validateScannerContainer,
    createScannerConfig,
    setupQRCodeCallback
  };
};
