
import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseScannerStateProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  scannerContainerId: string;
  onScanSuccess: (decodedText: string) => void;
}

export const useScannerState = ({
  scannerRef,
  scannerContainerId,
  onScanSuccess
}: UseScannerStateProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const stopInProgressRef = useRef(false);

  // Set mounted ref to false when unmounting
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stop camera and release resources
  const stopCamera = async () => {
    // Prevent duplicate stop calls
    if (stopInProgressRef.current) {
      console.log("Stop already in progress, skipping duplicate call");
      return;
    }
    
    try {
      stopInProgressRef.current = true;
      console.log("Stopping camera...");
      
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.stop();
          console.log("Camera stopped successfully from scanner");
        } catch (err) {
          console.error("Error stopping camera:", err);
        }
      }
      
      // Additional cleanup to ensure all camera resources are released
      // But add a small delay to prevent race conditions
      setTimeout(() => {
        try {
          stopAllVideoStreams();
          console.log("All video streams stopped");
        } catch (err) {
          console.error("Error in stopAllVideoStreams:", err);
        }
        
        // Update state only if component is still mounted
        if (mountedRef.current) {
          setIsScanning(false);
          setCameraActive(false);
        }
        stopInProgressRef.current = false;
      }, 150);
    } catch (error) {
      console.error("Error in stopCamera:", error);
      // Even if there's an error, still try to stop all video streams as a fallback
      stopAllVideoStreams();
      stopInProgressRef.current = false;
    }
  };

  return {
    cameraActive,
    isScanning,
    error,
    stopCamera,
    setCameraActive,
    setIsScanning,
    setError,
    mountedRef
  };
};
