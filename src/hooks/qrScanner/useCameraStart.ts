
import { useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

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
      
      // Make sure container element exists and has dimensions
      const containerElement = document.getElementById(scannerContainerId);
      if (!containerElement) {
        throw new Error("Scanner container element not found");
      }
      
      // Log container dimensions to help debug
      const rect = containerElement.getBoundingClientRect();
      console.log("Scanner container dimensions:", rect.width, rect.height);
      
      if (rect.width < 10 || rect.height < 10) {
        console.log("Container has insufficient dimensions, adding delay");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check again after delay
        if (!mountedRef.current) return;
        
        const updatedRect = containerElement.getBoundingClientRect();
        if (updatedRect.width < 10 || updatedRect.height < 10) {
          throw new Error("Scanner container has insufficient dimensions");
        }
      }
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log("Successfully scanned QR code:", decodedText);
        // Handle the scanned code here
        onScanSuccess(decodedText);
        
        // Stop scanning after successful scan
        stopCamera();
      };

      const config = {
        fps: 10, // Lower FPS for more stability
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: ["QR_CODE"],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      // Set timeout to prevent infinite loading when camera permissions are denied
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && !cameraActive) {
          setError("Camera access timed out. Please ensure camera permissions are enabled and try again.");
          setIsScanning(false);
        }
      }, 15000); // Longer timeout

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
      console.error("Error starting QR scanner:", err);
      
      if (!mountedRef.current) return;
      
      setIsScanning(false);
      setCameraActive(false);
      
      if (err.toString().includes("permission")) {
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      } else {
        setError("Could not access the camera. Please ensure your device has a working camera.");
      }
      
      // Try with user-facing camera as fallback
      tryFallbackCamera(currentAttempt);
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
    cameraActive
  ]);

  // Helper function for fallback camera
  const tryFallbackCamera = useCallback(async (currentAttempt: number) => {
    try {
      if (mountedRef.current && scannerRef.current) {
        console.log("Trying with user-facing camera...");
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: ["QR_CODE"]
        };
        
        await scannerRef.current.start(
          { facingMode: "user" },
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            stopCamera();
          },
          () => {}
        );
        
        if (mountedRef.current) {
          setCameraActive(true);
          setError(null);
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback camera also failed:", fallbackErr);
    }
  }, [scannerRef, mountedRef, onScanSuccess, stopCamera, setCameraActive, setError]);

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
