
import { useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useScannerInitialization } from "./useScannerInitialization";
import { useCameraUtils } from "./useCameraUtils";
import { useCameraInitiator } from "./useCameraInitiator";
import { useCameraRetry } from "./useCameraRetry";

interface UseCameraStartProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  scannerContainerId: string;
  stopCamera: () => Promise<void>;
  isScanning: boolean;
  cameraActive: boolean;
  setIsScanning: (value: boolean) => void;
  setCameraActive: (value: boolean) => void;
  setError: (error: string | null) => void;
  mountedRef: React.MutableRefObject<boolean>;
  onScanSuccess: (decodedText: string) => void;
  initAttemptCount: number;
  incrementAttempt: () => number;
}

export const useCameraStart = ({
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
  incrementAttempt
}: UseCameraStartProps) => {
  
  // Import scanner initialization utilities
  const {
    validateScannerContainer,
    createScannerConfig,
    setupQRCodeCallback
  } = useScannerInitialization({
    scannerRef,
    scannerContainerId,
    stopCamera,
    setIsScanning,
    setError,
    setCameraActive,
    mountedRef,
    onScanSuccess
  });
  
  // Import camera utilities
  const {
    tryFallbackCamera,
    setupCameraTimeout,
    handleCameraError
  } = useCameraUtils({
    scannerRef,
    onScanSuccess,
    stopCamera,
    mountedRef,
    setCameraActive,
    setError
  });

  // Import camera initiator
  const {
    initializeScanner,
    resetStartingState,
    isStarting
  } = useCameraInitiator({
    scannerRef,
    scannerContainerId,
    mountedRef,
    setIsScanning,
    setError,
    isScanning,
    incrementAttempt
  });

  // Memoize the startScanner function
  const startScanner = useCallback(async () => {
    // Initialize the scanner
    const initialized = await initializeScanner();
    if (!initialized) return;

    try {
      // Validate scanner container
      const isContainerValid = await validateScannerContainer();
      if (!isContainerValid || !mountedRef.current) {
        resetStartingState();
        return;
      }
      
      // Create QR code callback
      const qrCodeSuccessCallback = setupQRCodeCallback(onScanSuccess, stopCamera);
      
      // Get scanner configuration
      const config = createScannerConfig();

      // Set timeout to prevent infinite loading when camera permissions are denied
      const timeoutId = setupCameraTimeout(cameraActive);

      // Track the scan attempt
      const currentAttempt = incrementAttempt();
      console.log(`Attempting to start camera (attempt ${currentAttempt})...`);

      // Start scanning - using facingMode object format for better compatibility
      try {
        await scannerRef.current.start(
          { facingMode: { exact: "environment" } },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // Only log essential errors to reduce console noise
            if (!errorMessage.includes("No MultiFormat Readers")) {
              console.log("QR Scanner error:", errorMessage);
            }
          }
        );
        
        if (!mountedRef.current) {
          // If unmounted during initialization, stop camera
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
            } catch (err) {
              console.error("Error stopping camera after unmount:", err);
            }
          }
          resetStartingState();
          return;
        }
        
        console.log("QR scanner started successfully");
        setCameraActive(true);
        clearTimeout(timeoutId);
      } catch (err: any) {
        console.error("Error starting camera:", err);
        
        // Try fallback camera if initial attempt fails
        if (currentAttempt <= 2) {
          console.log("Trying fallback camera options...");
          const fallbackSuccess = await tryFallbackCamera(config, qrCodeSuccessCallback);
          
          if (fallbackSuccess) {
            console.log("Fallback camera started successfully");
            setCameraActive(true);
            clearTimeout(timeoutId);
            resetStartingState();
            return;
          }
        }
        
        handleCameraError(err, currentAttempt);
      }
    } catch (err: any) {
      handleCameraError(err, incrementAttempt());
    } finally {
      // Reset starting flag
      resetStartingState();
    }
  }, [
    scannerRef, 
    validateScannerContainer, 
    createScannerConfig, 
    setupQRCodeCallback, 
    mountedRef, 
    onScanSuccess, 
    stopCamera, 
    setCameraActive,
    cameraActive,
    setupCameraTimeout,
    handleCameraError,
    incrementAttempt,
    initializeScanner,
    resetStartingState,
    tryFallbackCamera
  ]);

  // Set up camera retry logic
  useCameraRetry({
    isScanning,
    cameraActive,
    mountedRef,
    isStarting,
    startScanner
  });

  return { startScanner };
};
