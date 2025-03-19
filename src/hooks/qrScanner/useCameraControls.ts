
import { useEffect, useRef } from "react";
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

  // No automatic camera start on init - let component explicitly call startScanner
  
  // Reset the attempt flag when component is remounted
  const resetStartAttempt = () => {
    console.log("Resetting camera start attempt flag");
    hasAttemptedStart.current = false;
    
    // Also explicitly stop any existing camera when resetting
    stopAllVideoStreams();
  };

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
    resetStartAttempt,
    setError
  };
};
