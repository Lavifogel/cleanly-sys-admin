
import { useEffect, useRef } from "react";
import { useCameraInitialization } from "./useCameraInitialization";
import { Html5Qrcode } from "html5-qrcode";

interface UseCameraSetupProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraSetup = ({ onScanSuccess }: UseCameraSetupProps) => {
  // Initialize camera components
  const { 
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount
  } = useCameraInitialization();

  // Track scanner initialization
  const scannerInitializedRef = useRef(false);

  // Effect to check if scanner is initialized
  useEffect(() => {
    if (scannerRef.current && !scannerInitializedRef.current) {
      scannerInitializedRef.current = true;
      console.log("Scanner reference initialized in useCameraSetup");
    }
  }, [scannerRef.current]);

  return {
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount
  };
};
