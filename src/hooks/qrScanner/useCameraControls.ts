
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
  const cleanupInProgressRef = useRef(false);
  
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

  // Wrap onScanSuccess to ensure camera is stopped after a successful scan
  const handleScanSuccess = useRef((decodedText: string) => {
    // Prevent duplicate processing
    if (cleanupInProgressRef.current) {
      console.log("Cleanup already in progress, ignoring duplicate scan success");
      return;
    }
    
    cleanupInProgressRef.current = true;
    
    // First force stop all streams
    stopAllVideoStreams();
    
    // Then use the API to ensure complete cleanup
    stopCamera().then(() => {
      // Force stop all streams as a backup
      stopAllVideoStreams();
      
      // Wait a bit to ensure camera is fully stopped before calling success handler
      setTimeout(() => {
        cleanupInProgressRef.current = false;
        if (mountedRef.current) {
          onScanSuccess(decodedText);
        }
      }, 200);
    }).catch(err => {
      console.error("Error stopping camera after scan:", err);
      stopAllVideoStreams(); // Force stop as fallback
      
      cleanupInProgressRef.current = false;
      if (mountedRef.current) {
        onScanSuccess(decodedText); // Still call success even if stop fails
      }
    });
  }).current;

  // Start scanning when the scanner is initialized
  useEffect(() => {
    // Use a flag to ensure we only attempt to start the camera once per mount
    if (scannerRef.current && !isScanning && !hasAttemptedStart.current) {
      hasAttemptedStart.current = true;
      
      // Force stop any existing streams first
      stopAllVideoStreams();
      
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
      cleanupInProgressRef.current = true;
      
      if (scannerRef.current) {
        if (isScanning) {
          stopCamera().catch(err => {
            console.error("Error stopping camera on unmount:", err);
            stopAllVideoStreams();
          });
        } else {
          // Force stop even if not scanning, just to be sure
          stopAllVideoStreams();
        }
      } else {
        // Force stop even if scanner ref is null
        stopAllVideoStreams();
      }
      
      // Final cleanup after a delay
      setTimeout(() => {
        stopAllVideoStreams();
      }, 500);
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
