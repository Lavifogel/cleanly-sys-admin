
import { useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useCameraControls } from "./useCameraControls";
import { useFileInput } from "./useFileInput";
import { useSimulation } from "./useSimulation";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { QRScannerStates } from "@/types/qrScanner";

interface UseQRScannerLogicProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
}

export const useQRScannerLogic = ({ onScanSuccess, onClose }: UseQRScannerLogicProps) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";
  
  // Initialize scanner on first render
  const initializeScanner = useCallback(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
    }
    return scannerRef.current;
  }, [scannerContainerId]);

  // Camera controls hook
  const {
    cameraActive,
    isScanning,
    stopCamera,
    startScanner,
    setError
  } = useCameraControls({ 
    onScanSuccess, 
    scannerContainerId 
  });

  // Simulation hook
  const {
    simulationActive,
    simulationProgress,
    startSimulation,
    resetSimulation
  } = useSimulation({ onScanSuccess });

  // File input hook
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleTakePicture = () => {
    setIsTakingPicture(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setIsTakingPicture(false);
      return;
    }

    const imageFile = files[0];
    const scanner = initializeScanner();
    
    try {
      // Stop live scanning if it's active
      if (isScanning) {
        await stopCamera();
      }

      // Scan the QR code from the image
      const result = await scanner.scanFile(imageFile, true);
      onScanSuccess(result);
    } catch (error) {
      console.error("Error scanning image:", error);
      setError("Could not detect a QR code in the image. Please try again.");
      
      // Restart live scanning
      if (!isScanning) {
        startScanner();
      }
    } finally {
      setIsTakingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle close
  const handleClose = () => {
    stopCamera();
    stopAllVideoStreams();
    if (onClose) onClose();
  };

  // Handle manual simulation
  const handleManualSimulation = () => {
    stopCamera();
    startSimulation();
  };

  // Create a scanner state object to pass to components
  const scannerState: QRScannerStates = {
    isScanning,
    error: scanError,
    isTakingPicture,
    cameraActive,
    simulationActive,
    simulationProgress
  };

  // Clean up on unmount
  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    }
    stopAllVideoStreams();
  }, []);

  return {
    // Public API
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation,
    cleanup
  };
};
