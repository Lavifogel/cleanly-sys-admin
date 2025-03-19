
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
  
  // Check if scanner container is valid with appropriate dimensions
  const validateScannerContainer = useCallback(async (): Promise<boolean> => {
    // Check if container exists
    const containerElement = document.getElementById(scannerContainerId);
    if (!containerElement) {
      console.log(`Container element '${scannerContainerId}' not found`);
      setError("Scanner initialization failed. Please try again.");
      return false;
    }
    
    // Wait a brief moment to ensure the container is properly sized in the DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get dimensions after a slight delay
    const rect = containerElement.getBoundingClientRect();
    console.log("Scanner container dimensions:", rect.width, rect.height);
    
    // Ensure container has some minimum dimensions
    if (rect.width < 100 || rect.height < 100) {
      console.log("Container has insufficient dimensions, adding delay");
      
      // Add a longer delay and try again for late-rendering containers
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get dimensions again after the delay
      const newRect = containerElement.getBoundingClientRect();
      console.log("Scanner container dimensions after delay:", newRect.width, newRect.height);
      
      // Final check
      if (newRect.width < 100 || newRect.height < 100) {
        console.error("Scanner container has insufficient dimensions after delay");
        setError("QR Scanner could not initialize. Please try again.");
        return false;
      }
    }
    
    return true;
  }, [scannerContainerId, setError]);

  // Create configuration for QR scanner
  const createScannerConfig = useCallback(() => {
    return {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      formatsToSupport: ['QR_CODE'], // Changed from Html5Qrcode.FORMATS.QR_CODE to string literal
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    };
  }, []);

  // Setup QR code success callback
  const setupQRCodeCallback = useCallback((
    onScanSuccess: (decodedText: string) => void,
    stopCamera: () => Promise<void>
  ) => {
    // Return the success handler function
    return (decodedText: string) => {
      if (!mountedRef.current) return;
      
      console.log("QR code scanned successfully:", decodedText);
      setIsScanning(false);
      
      // Call the original success callback
      onScanSuccess(decodedText);
    };
  }, [mountedRef, setIsScanning]);

  return {
    validateScannerContainer,
    createScannerConfig,
    setupQRCodeCallback
  };
};
