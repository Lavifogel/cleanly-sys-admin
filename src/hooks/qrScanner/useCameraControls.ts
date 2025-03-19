
import { useEffect, useRef } from "react";
import { useCameraSetup } from "./useCameraSetup";
import { useScannerState } from "./useScannerState";
import { useCameraStart } from "./useCameraStart";

interface UseCameraControlsProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraControls = ({ onScanSuccess }: UseCameraControlsProps) => {
  // Track whether we've attempted to start the camera
  const hasAttemptedStart = useRef(false);
  
  // Initialize camera components
  const { 
    scannerRef, 
    scannerContainerId, 
    incrementAttempt,
    initAttemptCount
  } = useCameraSetup({ onScanSuccess });

  // Setup camera state
  const {
    cameraActive,
    isScanning,
    error,
    stopCamera,
    setCameraActive,
    setIsScanning,
    setError,
    mountedRef
  } = useScannerState({
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
    // Use a flag to ensure we only attempt to start the camera once per mount
    if (scannerRef.current && !isScanning && !hasAttemptedStart.current) {
      hasAttemptedStart.current = true;
      const startTimer = setTimeout(() => {
        console.log("Starting scanner after initialization");
        startScanner();
      }, 800);
      
      return () => clearTimeout(startTimer);
    }
  }, [scannerRef.current, isScanning, startScanner]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("useCameraControls unmounting, cleaning up camera resources");
      if (scannerRef.current && isScanning) {
        stopCamera();
      }
    };
  }, []);

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
