
import { useCallback } from "react";
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
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
      const fullConfig = createScannerConfig();
      
      // Create a camera-specific config from the full config
      const cameraScanConfig: Html5QrcodeCameraScanConfig = {
        fps: fullConfig.fps,
        qrbox: fullConfig.qrbox,
        aspectRatio: undefined,
        disableFlip: false,
        formatsToSupport: fullConfig.formatsToSupport,
        experimentalFeatures: fullConfig.experimentalFeatures
      };

      // Set timeout to prevent infinite loading when camera permissions are denied
      const timeoutId = setupCameraTimeout(cameraActive);

      // Track the scan attempt
      const currentAttempt = incrementAttempt();
      console.log(`Attempting to start camera (attempt ${currentAttempt})...`);

      // Try with more relaxed camera constraints
      try {
        // First try with any available camera (no specific constraints)
        await scannerRef.current.start(
          { facingMode: "environment" }, // More relaxed constraint as object
          cameraScanConfig,
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
        console.error("Error starting camera with environment facing mode:", err);
        
        // Try with no constraints at all
        if (currentAttempt <= 2 && mountedRef.current) {
          console.log("Trying with no camera constraints...");
          try {
            await scannerRef.current.start(
              { facingMode: { ideal: "environment" } }, // Use a more generic constraint instead of boolean
              cameraScanConfig,
              qrCodeSuccessCallback,
              () => {}
            );
            
            if (mountedRef.current) {
              console.log("Camera started with more generic constraints");
              setCameraActive(true);
              clearTimeout(timeoutId);
              resetStartingState();
              return;
            }
          } catch (fallbackErr) {
            console.error("Error starting with generic constraints:", fallbackErr);
            
            // Try one more fallback approach
            await tryFallbackCamera(fullConfig, qrCodeSuccessCallback);
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
