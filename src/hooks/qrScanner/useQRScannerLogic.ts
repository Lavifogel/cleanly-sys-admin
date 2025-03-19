
import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
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

  // Initialize the scanner when component mounts
  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    // Clean up when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  // Start scanning when the scanner is initialized
  useEffect(() => {
    if (scannerRef.current && !isScanning) {
      startScanner();
    }
  }, [scannerRef.current]);

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
    handleManualSimulation
  };
};
