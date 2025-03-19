
import { useEffect } from "react";
import { QRScannerStates } from "@/types/qrScanner";
import { useCameraControls } from "./useCameraControls";
import { useSimulation } from "./useSimulation";
import { useFileInput } from "./useFileInput";

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

  // Initialize the scanner when component mounts with a slight delay to ensure DOM is ready
  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (scannerRef.current) {
        console.log("Scanner reference already exists, starting scanner");
        if (!isScanning) {
          startScanner();
        }
      }
    }, 500);
    
    // Clean up when component unmounts
    return () => {
      clearTimeout(initTimer);
      stopCamera();
    };
  }, []);

  const handleClose = () => {
    stopCamera(); // Ensure camera is stopped before closing
    resetSimulation(); // Reset any active simulation
    onClose();
  };

  const handleManualSimulation = () => {
    // This is for demonstration only - simulates a successful scan
    startSimulation();
  };

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
