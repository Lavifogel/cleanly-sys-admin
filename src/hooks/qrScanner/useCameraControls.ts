
import { useEffect } from "react";
import { useCameraInitialization } from "./useCameraInitialization";
import { useCameraOperations } from "./useCameraOperations";
import { useCameraStart } from "./useCameraStart";

interface UseCameraControlsProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraControls = ({ onScanSuccess }: UseCameraControlsProps) => {
  // Initialize camera components
  const { 
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount
  } = useCameraInitialization();

  // Setup camera operations
  const {
    cameraActive,
    isScanning,
    error,
    stopCamera,
    setCameraActive,
    setIsScanning,
    setError,
    mountedRef
  } = useCameraOperations({
    scannerRef,
    scannerContainerId,
    onScanSuccess
  });

  // Setup camera start functionality
  const { startScanner } = useCameraStart({
    scannerRef,
    scannerContainerId,
    stopCamera,
    isScanning,
    cameraActive,
    setIsScanning,
    setCameraActive,
    setError,
    mountedRef,
    onScanSuccess,
    initAttemptCount,
    incrementAttempt
  });

  // Start scanning when the scanner is initialized
  useEffect(() => {
    const startTimer = setTimeout(() => {
      if (scannerRef.current && !isScanning) {
        console.log("Starting scanner after initialization");
        startScanner();
      }
    }, 800);
    
    return () => clearTimeout(startTimer);
  }, [scannerRef.current, isScanning, startScanner]);

  return {
    cameraActive,
    isScanning,
    error,
    scannerRef,
    scannerContainerId,
    stopCamera,
    startScanner,
    setError
  };
};
