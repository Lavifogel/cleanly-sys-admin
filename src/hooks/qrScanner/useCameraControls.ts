
import { useState, useRef, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseCameraControlsProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraControls = ({ onScanSuccess }: UseCameraControlsProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";
  const initAttemptRef = useRef(0);
  const isInitializedRef = useRef(false);

  // Memoize the stopCamera function to prevent unnecessary re-creations
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        console.log("Camera stopped successfully from scanner");
      }
      
      // Additional cleanup to ensure all camera resources are released
      stopAllVideoStreams();
      
      setIsScanning(false);
      setCameraActive(false);
    } catch (error) {
      console.error("Error stopping camera:", error);
      // Even if there's an error, still try to stop all video streams as a fallback
      stopAllVideoStreams();
    }
  }, [isScanning]);

  // Memoize the startScanner function
  const startScanner = useCallback(async () => {
    if (!scannerRef.current) {
      console.error("Scanner reference not initialized");
      return;
    }

    // Increase attempt counter
    initAttemptRef.current += 1;
    const currentAttempt = initAttemptRef.current;

    // First, make sure any existing camera is stopped
    await stopCamera();

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 300));

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
      
      if (rect.width === 0 || rect.height === 0) {
        console.log("Container has zero dimensions, adding delay");
        await new Promise(resolve => setTimeout(resolve, 500));
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
        if (currentAttempt === initAttemptRef.current && !cameraActive) {
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
      
      console.log("QR scanner started successfully");
      setCameraActive(true);
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error("Error starting QR scanner:", err);
      setIsScanning(false);
      setCameraActive(false);
      
      if (err.toString().includes("permission")) {
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      } else {
        setError("Could not access the camera. Please ensure your device has a working camera.");
      }
      
      // Try with user-facing camera as fallback
      try {
        if (currentAttempt === initAttemptRef.current) {
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
          
          setCameraActive(true);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error("Fallback camera also failed:", fallbackErr);
      }
    }
  }, [onScanSuccess, stopCamera, cameraActive]);

  // Improved retry mechanism for scanner initialization
  useEffect(() => {
    if (isScanning && !cameraActive && initAttemptRef.current < 3) {
      const timeoutId = setTimeout(() => {
        if (isScanning && !cameraActive) {
          console.log("Camera not active after timeout, attempting restart...");
          startScanner();
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isScanning, cameraActive, startScanner]);

  // Initialize HTML5QrCode instance only once
  useEffect(() => {
    if (!isInitializedRef.current) {
      // Slight delay to ensure container is ready
      const timeoutId = setTimeout(() => {
        try {
          if (!scannerRef.current) {
            console.log("Initializing HTML5QrCode instance");
            scannerRef.current = new Html5Qrcode(scannerContainerId);
            isInitializedRef.current = true;
          }
        } catch (error) {
          console.error("Error initializing scanner:", error);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return {
    cameraActive,
    isScanning,
    error,
    scannerRef,
    scannerContainerId,
    stopCamera,
    startScanner,
    setError
  };
};
