
import { useEffect } from "react";
import { useCameraInitialization } from "./useCameraInitialization";

interface UseCameraSetupProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraSetup = ({ onScanSuccess }: UseCameraSetupProps) => {
  // Initialize camera components
  const { 
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount,
    isInitialized
  } = useCameraInitialization();

  // Effect to check if scanner is initialized
  useEffect(() => {
    if (scannerRef.current) {
      console.log("Scanner reference initialized in useCameraSetup");
    }
  }, [scannerRef.current]);

  return {
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount,
    isInitialized
  };
};
