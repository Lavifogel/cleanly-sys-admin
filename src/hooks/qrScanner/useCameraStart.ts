
import { useCallback, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useScannerInitialization } from "./useScannerInitialization";
import { useCameraUtils } from "./useCameraUtils";
import { useCameraInitiator } from "./useCameraInitiator";
import { useCameraRetry } from "./useCameraRetry";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

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
  const startingRef = useRef(false);
  
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

  // Function to ensure permissions are properly requested and handled
  const ensureCameraPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // First stop any existing streams
      stopAllVideoStreams();
      
      console.log("Requesting camera permissions...");
      // Request camera permissions explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      });
      
      // If we got a stream, release it immediately - we only wanted to trigger the permission prompt
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera permissions granted");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
      // If permission denied, we'll report this specific error
      if (error instanceof Error && error.name === "NotAllowedError") {
        setError("Camera access denied. Please grant camera permissions.");
      }
      return false;
    }
  }, [setError]);

  // Force stop any active scan before trying to start a new one
  const forceStopExistingScan = useCallback(async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        // First try to stop via the scanner API
        await scannerRef.current.stop();
        console.log("Successfully stopped existing scanner");
      } catch (error) {
        console.log("Error stopping scanner, trying force cleanup:", error);
      }
    }
    
    // Regardless of success/failure above, force stop all video streams
    stopAllVideoStreams();
    
    // Wait a moment to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));
  }, [scannerRef]);

  // Memoize the startScanner function
  const startScanner = useCallback(async () => {
    // Prevent multiple simultaneous start attempts
    if (startingRef.current || isStarting()) {
      console.log("Skipping camera start: already starting");
      return;
    }
    
    // Set starting flag to prevent concurrent starts
    startingRef.current = true;
    
    try {
      // Force stop any existing scanner first to avoid "scan is ongoing" errors
      await forceStopExistingScan();
      
      if (!mountedRef.current) {
        console.log("Component unmounted during cleanup, aborting");
        resetStartingState();
        startingRef.current = false;
        return;
      }

      // First ensure we have camera permissions
      const permissionsGranted = await ensureCameraPermissions();
      if (!permissionsGranted) {
        console.log("Camera permissions were not granted");
        resetStartingState();
        startingRef.current = false;
        return;
      }
      
      // Initialize the scanner
      const initialized = await initializeScanner();
      if (!initialized || !mountedRef.current) {
        console.log("Scanner initialization failed or component unmounted");
        startingRef.current = false;
        return;
      }

      // Validate scanner container
      const isContainerValid = await validateScannerContainer();
      if (!isContainerValid || !mountedRef.current) {
        console.log("Scanner container validation failed");
        resetStartingState();
        startingRef.current = false;
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

      // First try with environment camera (rear camera on mobile)
      try {
        if (!scannerRef.current || !mountedRef.current) {
          console.log("Scanner ref is null or component unmounted before starting camera");
          clearTimeout(timeoutId);
          resetStartingState();
          startingRef.current = false;
          return;
        }
        
        console.log("Starting camera with environment facing mode...");
        
        // Ensure we're not already scanning before starting
        if (isScanning) {
          console.log("Already scanning, stopping current scan before starting new one");
          await forceStopExistingScan();
          if (!mountedRef.current) {
            resetStartingState();
            startingRef.current = false;
            return;
          }
        }
        
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
          clearTimeout(timeoutId);
          resetStartingState();
          startingRef.current = false;
          return;
        }
        
        console.log("QR scanner started successfully with environment camera");
        setIsScanning(true);
        setCameraActive(true);
        clearTimeout(timeoutId);
      } catch (err: any) {
        console.error("Error starting environment camera:", err);
        
        // If we get the "scan is ongoing" error, try to force stop and restart
        if (err.toString().includes("scan is ongoing")) {
          console.log("Detected 'scan is ongoing' error, force stopping and retrying...");
          await forceStopExistingScan();
          
          // Only retry if component is still mounted
          if (mountedRef.current && currentAttempt <= 2) {
            console.log("Retrying camera start after force stop...");
            clearTimeout(timeoutId);
            resetStartingState();
            startingRef.current = false;
            // Small delay before retry
            setTimeout(() => startScanner(), 500);
            return;
          }
        }
        
        // Try fallback camera if initial attempt fails
        if (currentAttempt <= 2 && mountedRef.current) {
          console.log("Trying fallback camera options...");
          const fallbackSuccess = await tryFallbackCamera(config, qrCodeSuccessCallback);
          
          // Check if fallback was successful
          if (fallbackSuccess && mountedRef.current) {
            console.log("Fallback camera started successfully");
            setIsScanning(true);
            setCameraActive(true);
            clearTimeout(timeoutId);
            resetStartingState();
            startingRef.current = false;
            return;
          }
        }
        
        handleCameraError(err, currentAttempt);
      }
    } catch (err: any) {
      handleCameraError(err, incrementAttempt());
    } finally {
      // Reset starting flags
      resetStartingState();
      startingRef.current = false;
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
    setIsScanning,
    cameraActive,
    setupCameraTimeout,
    handleCameraError,
    incrementAttempt,
    initializeScanner,
    resetStartingState,
    isStarting,
    tryFallbackCamera,
    ensureCameraPermissions,
    forceStopExistingScan,
    isScanning
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
