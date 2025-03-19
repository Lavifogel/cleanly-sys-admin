
import { useEffect } from "react";
import { QRScannerStates } from "@/types/qrScanner";
import { useCameraControls } from "./qrScanner/useCameraControls";
import { useSimulation } from "./qrScanner/useSimulation";
import { useFileInput } from "./qrScanner/useFileInput";
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
    // Ensure no existing camera streams are running when mounting
    stopAllVideoStreams();
    
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
    stopAllVideoStreams();  // Force stop all streams first
    
    // Add a delay to ensure complete cleanup before calling stopCamera
    setTimeout(async () => {
      await stopCamera(); // Ensure camera is stopped before closing
      resetSimulation(); // Reset any active simulation
      onClose();
    }, 300);
  };

  const handleManualSimulation = () => {
    // Stop camera before starting simulation
    stopCamera().then(() => {
      // This is for demonstration only - simulates a successful scan
      startSimulation();
    }).catch(err => {
      console.error("Error stopping camera before simulation:", err);
      // Force stop all video streams as a fallback
      stopAllVideoStreams();
      // Still start simulation even if there was an error stopping camera
      startSimulation();
    });
  };

  return {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation,
    startScanner
  };
};
