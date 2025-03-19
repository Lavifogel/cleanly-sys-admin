
import { useEffect, useRef, useCallback } from "react";
import { useCameraSetup } from "./useCameraSetup";
import { useScannerState } from "./useScannerState";
import { useCameraStart } from "./useCameraStart";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseCameraControlsProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraControls = ({ onScanSuccess }: UseCameraControlsProps) => {
  // Track whether we've attempted to start the camera
  const hasAttemptedStart = useRef(false);
  const hasCleanedUp = useRef(false);
  
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

  // Force camera start explicitly to ensure consistency
  const forceCameraStart = useCallback(async () => {
    console.log("Force starting camera...");
    
    // Ensure any previous camera is fully stopped first
    await stopCamera();
    
    // Small delay to ensure resources are released
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Reset flags and start camera
    hasAttemptedStart.current = true;
    return startScanner();
  }, [startScanner, stopCamera]);
  
  // Reset the attempt flag when component is remounted
  const resetStartAttempt = useCallback(() => {
    console.log("Resetting camera start attempt flag");
    hasAttemptedStart.current = false;
    hasCleanedUp.current = false;
    
    // Also explicitly stop any existing camera when resetting
    stopAllVideoStreams();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("useCameraControls unmounting, cleaning up camera resources");
      if (!hasCleanedUp.current) {
        if (scannerRef.current && isScanning) {
          stopCamera();
        }
        stopAllVideoStreams();
        hasCleanedUp.current = true;
      }
    };
  }, [stopCamera, isScanning]);

  return {
    cameraActive,
    isScanning,
    error,
    scannerRef,
    scannerContainerId,
    stopCamera,
    startScanner: forceCameraStart, // Return the forced version for more reliability
    resetStartAttempt,
    setError
  };
};
