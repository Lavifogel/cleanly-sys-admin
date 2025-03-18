
import { useCallback, useEffect } from "react";
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
    if (!scannerRef.current) {
      console.error("Scanner reference not initialized");
      return;
    }

    if (!mountedRef.current) {
      console.log("Component unmounted, aborting camera start");
      return;
    }

    // Increase attempt counter
    const currentAttempt = incrementAttempt();

    // First, make sure any existing camera is stopped
    await stopCamera();

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!mountedRef.current) return;
    
    setIsScanning(true);
    setError(null);

    try {
      console.log(`Starting QR scanner (attempt ${currentAttempt})...`);
      
      // Validate scanner container
      const isContainerValid = await validateScannerContainer();
      if (!isContainerValid || !mountedRef.current) return;
      
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
        scannerRef.current.stop().catch(console.error);
        return;
      }
      
      console.log("QR scanner started successfully");
      setCameraActive(true);
      clearTimeout(timeoutId);
    } catch (err: any) {
      handleCameraError(err, currentAttempt);
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
    validateScannerContainer,
    createScannerConfig,
    setupQRCodeCallback,
    setupCameraTimeout,
    handleCameraError
  ]);

  // Improved retry mechanism for scanner initialization
  useEffect(() => {
    if (isScanning && !cameraActive && mountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isScanning && !cameraActive && mountedRef.current) {
          console.log("Camera not active after timeout, attempting restart...");
          startScanner();
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isScanning, cameraActive, startScanner, mountedRef]);

  return { startScanner };
};
