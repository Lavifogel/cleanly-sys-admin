
import { useEffect, useCallback } from "react";
import { QRScannerStates } from "@/types/qrScanner";
import { useCameraControls } from "./useCameraControls";
import { useSimulation } from "./useSimulation";
import { useFileInput } from "./useFileInput";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export const useQRScannerLogic = (
  onScanSuccess: (decodedText: string) => void,
  onClose: () => void
) => {
  const { 
    cameraActive, 
    isScanning, 
    error, 
    scannerRef, 
    scannerContainerId, 
    stopCamera, 
    startScanner,
    resetStartAttempt,
    setError 
  } = useCameraControls({ onScanSuccess });

  const { 
    simulationActive, 
    simulationProgress, 
    startSimulation, 
    resetSimulation 
  } = useSimulation({ onScanSuccess });

  const { 
    isTakingPicture, 
    fileInputRef, 
    handleTakePicture, 
    handleFileSelect 
  } = useFileInput({
    onScanSuccess,
    scannerRef,
    stopCamera,
    startScanner,
    setError,
    isScanning
  });

  // Combine all states into a single scanner state object
  const scannerState: QRScannerStates = {
    isScanning,
    error,
    isTakingPicture,
    cameraActive,
    simulationActive,
    simulationProgress
  };

  // Start the scanner when the component mounts
  useEffect(() => {
    // Clean up any existing camera resources first
    stopAllVideoStreams();
    
    // Force camera initialization on mount with a delay
    const initTimer = setTimeout(() => {
      console.log("Initializing scanner from useQRScannerLogic");
      // Explicitly start the scanner
      startScanner();
    }, 500);
    
    return () => {
      clearTimeout(initTimer);
      resetStartAttempt();
      stopCamera();
      resetSimulation();
    };
  }, [startScanner, stopCamera, resetStartAttempt, resetSimulation]);

  const handleClose = useCallback(() => {
    stopCamera(); // Ensure camera is stopped before closing
    resetSimulation(); // Reset any active simulation
    // Add small delay before calling onClose to ensure cleanup is complete
    setTimeout(() => {
      onClose();
    }, 100);
  }, [onClose, stopCamera, resetSimulation]);

  const handleManualSimulation = useCallback(() => {
    // This is for demonstration only - simulates a successful scan
    startSimulation();
  }, [startSimulation]);

  return {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation,
    startScanner, // Make sure to return startScanner
    stopCamera // Also return stopCamera for explicit camera control
  };
};
