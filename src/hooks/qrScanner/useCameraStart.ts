
import { useCallback, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useScannerInitialization } from "./useScannerInitialization";
import { useCameraUtils } from "./useCameraUtils";

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
  
  // Track whether scanner is in the process of starting
  const isStartingRef = useRef(false);
  
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

  // Memoize the startScanner function
  const startScanner = useCallback(async () => {
    // Prevent duplicate start attempts
    if (isStartingRef.current || !scannerRef.current || !mountedRef.current) {
      console.log("Skipping camera start: already starting or not mounted");
      return;
    }

    // Mark as starting
    isStartingRef.current = true;
    
    // Increase attempt counter
    const currentAttempt = incrementAttempt();

    try {
      // First, make sure any existing camera is stopped (but don't reset camera active state)
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.stop();
          console.log("Stopped existing scanner instance before restart");
        } catch (err) {
          console.log("Error stopping existing scanner:", err);
        }
      }

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mountedRef.current) {
        isStartingRef.current = false;
        return;
      }
      
      setIsScanning(true);
      setError(null);

      console.log(`Starting QR scanner (attempt ${currentAttempt})...`);
      
      // Validate scanner container
      const isContainerValid = await validateScannerContainer();
      if (!isContainerValid || !mountedRef.current) {
        isStartingRef.current = false;
        return;
      }
      
      // Create QR code callback
      const qrCodeSuccessCallback = setupQRCodeCallback(onScanSuccess, stopCamera);
      
      // Get scanner configuration
      const config = createScannerConfig();

      // Set timeout to prevent infinite loading when camera permissions are denied
      const timeoutId = setupCameraTimeout(cameraActive);

      // Start scanning with back camera (environment)
      await scannerRef.current.start(
        { facingMode: "environment" },
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
        isStartingRef.current = false;
        return;
      }
      
      console.log("QR scanner started successfully");
      setCameraActive(true);
      clearTimeout(timeoutId);
    } catch (err: any) {
      handleCameraError(err, currentAttempt);
    } finally {
      // Reset starting flag
      isStartingRef.current = false;
    }
  }, [
    scannerRef, 
    scannerContainerId, 
    stopCamera, 
    setIsScanning, 
    setError, 
    setCameraActive, 
    mountedRef, 
    onScanSuccess, 
    incrementAttempt, 
    cameraActive,
    isScanning,
    validateScannerContainer,
    createScannerConfig,
    setupQRCodeCallback,
    setupCameraTimeout,
    handleCameraError
  ]);

  // Improved retry mechanism for scanner initialization
  useEffect(() => {
    let retryTimeoutId: number | null = null;
    
    if (isScanning && !cameraActive && mountedRef.current && !isStartingRef.current) {
      retryTimeoutId = window.setTimeout(() => {
        if (isScanning && !cameraActive && mountedRef.current && !isStartingRef.current) {
          console.log("Camera not active after timeout, attempting restart...");
          startScanner();
        }
      }, 2000);
    }
    
    return () => {
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [isScanning, cameraActive, startScanner, mountedRef]);

  return { startScanner };
};
