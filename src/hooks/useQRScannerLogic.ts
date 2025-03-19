
import { useEffect, useRef } from "react";
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

  // Prevent multiple close attempts
  const isClosingRef = useRef(false);
  const mountTimestampRef = useRef(Date.now());
  const scanSuccessProcessedRef = useRef(false);

  // Initialize the scanner when component mounts with a slight delay to ensure DOM is ready
  useEffect(() => {
    // Ensure no existing camera streams are running when mounting
    stopAllVideoStreams();
    
    // Record mount timestamp
    mountTimestampRef.current = Date.now();
    scanSuccessProcessedRef.current = false;
    
    const initTimer = setTimeout(() => {
      if (scannerRef.current) {
        console.log("Scanner reference already exists, starting scanner");
        if (!isScanning) {
          startScanner();
        }
      }
    }, 800); // Increased delay to ensure DOM is fully ready
    
    // Clean up when component unmounts
    return () => {
      clearTimeout(initTimer);
      stopCamera();
    };
  }, []);

  const handleClose = () => {
    // Prevent multiple close attempts or closing too soon after mounting
    if (isClosingRef.current) {
      console.log("Close already in progress, ignoring duplicate request");
      return;
    }
    
    // Prevent closing too soon after mounting (minimum 2 seconds)
    const currentTime = Date.now();
    const timeSinceMount = currentTime - mountTimestampRef.current;
    
    if (timeSinceMount < 2000) {
      console.log(`Scanner mounted too recently (${timeSinceMount}ms), preventing early close`);
      return;
    }
    
    isClosingRef.current = true;
    stopAllVideoStreams();  // Force stop all streams first
    
    // Add a delay to ensure complete cleanup before calling stopCamera
    setTimeout(async () => {
      await stopCamera(); // Ensure camera is stopped before closing
      resetSimulation(); // Reset any active simulation
      
      // Add an additional delay before calling onClose
      setTimeout(() => {
        isClosingRef.current = false;
        onClose();
      }, 500);
    }, 500);
  };

  // Handle successful scan with debounce to prevent multiple processing
  const handleSuccessWithDebounce = (decodedText: string) => {
    // Prevent processing scans too soon after mounting
    const currentTime = Date.now();
    const timeSinceMount = currentTime - mountTimestampRef.current;
    
    if (timeSinceMount < 1500) {
      console.log(`Scanner mounted too recently (${timeSinceMount}ms), ignoring scan`);
      return;
    }
    
    // Prevent duplicate processing
    if (scanSuccessProcessedRef.current) {
      console.log("Scan already processed, ignoring duplicate");
      return;
    }
    
    scanSuccessProcessedRef.current = true;
    
    // Stop all camera streams and pass the decoded text to the success handler
    stopAllVideoStreams();
    
    // Add a delay to ensure complete camera cleanup
    setTimeout(() => {
      onScanSuccess(decodedText);
    }, 800);
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
    startScanner,
    onScanSuccess: handleSuccessWithDebounce
  };
};
