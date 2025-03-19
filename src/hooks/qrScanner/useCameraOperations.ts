
import { useState, useCallback, useEffect, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { Html5Qrcode } from "html5-qrcode";

interface UseCameraOperationsProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  scannerContainerId: string;
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraOperations = ({ 
  scannerRef, 
  scannerContainerId, 
  onScanSuccess 
}: UseCameraOperationsProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Set mounted ref to false when unmounting
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoize the stopCamera function to prevent unnecessary re-creations
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        console.log("Camera stopped successfully from scanner");
      }
      
      // Additional cleanup to ensure all camera resources are released
      stopAllVideoStreams();
      
      if (mountedRef.current) {
        setIsScanning(false);
        setCameraActive(false);
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
      // Even if there's an error, still try to stop all video streams as a fallback
      stopAllVideoStreams();
    }
  }, [isScanning, scannerRef]);

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
