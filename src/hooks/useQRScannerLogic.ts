
import { useEffect } from "react";
import { QRScannerStates } from "@/types/qrScanner";
import { useCameraControls } from "./qrScanner/useCameraControls";
import { useSimulation } from "./qrScanner/useSimulation";
import { useFileInput } from "./qrScanner/useFileInput";
import { useToast } from "./use-toast";

export const useQRScannerLogic = (
  onScanSuccess: (decodedText: string) => void,
  onClose: () => void
) => {
  const { toast } = useToast();
  
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
  // More aggressive start approach to ensure camera initializes properly
  useEffect(() => {
    console.log("useQRScannerLogic mounted, initializing camera");
    
    let startAttempts = 0;
    const maxAttempts = 3;
    
    const initScanner = () => {
      if (scannerRef.current) {
        console.log(`Starting scanner (attempt ${startAttempts + 1})`);
        startScanner();
      } else {
        console.log("Scanner reference not ready yet");
      }
    };
    
    // Try to start immediately
    initScanner();
    
    // Set up retry mechanism with increasing delays
    const retryIntervals = [800, 1500, 3000];
    
    const retryInit = () => {
      if (startAttempts < maxAttempts && !cameraActive) {
        const timerId = setTimeout(() => {
          startAttempts++;
          console.log(`Retry scanner initialization, attempt ${startAttempts}`);
          initScanner();
          
          // Schedule next retry if needed
          retryInit();
        }, retryIntervals[startAttempts]);
        
        return () => clearTimeout(timerId);
      }
      
      // If still not active after all attempts, show error toast
      if (startAttempts >= maxAttempts && !cameraActive) {
        const finalTimerId = setTimeout(() => {
          toast({
            title: "Camera Error",
            description: "Could not access camera. Please check permissions and try again.",
            variant: "destructive",
          });
        }, 4000);
        
        return () => clearTimeout(finalTimerId);
      }
    };
    
    // Set up the retry chain
    const cleanupRetry = retryInit();
    
    // Clean up when component unmounts
    return () => {
      if (cleanupRetry) cleanupRetry();
      stopCamera();
      resetSimulation();
    };
  }, [scannerRef, startScanner, stopCamera, resetSimulation, cameraActive, toast]);

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
