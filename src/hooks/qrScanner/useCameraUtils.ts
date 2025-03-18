
import { useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseCameraUtilsProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  onScanSuccess: (decodedText: string) => void;
  stopCamera: () => Promise<void>;
  mountedRef: React.MutableRefObject<boolean>;
  setCameraActive: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCameraUtils = ({
  scannerRef,
  onScanSuccess,
  stopCamera,
  mountedRef, 
  setCameraActive,
  setError
}: UseCameraUtilsProps) => {
  
  // Try fallback camera options in sequence
  const tryFallbackCamera = useCallback(async (config: any, qrCodeSuccessCallback: (decodedText: string) => void): Promise<boolean> => {
    if (!mountedRef.current || !scannerRef.current) return false;
    
    // Try simple auto mode first
    try {
      console.log("Trying with auto facing mode...");
      await scannerRef.current.start(
        { facingMode: "user" }, // Try user-facing camera
        config,
        qrCodeSuccessCallback,
        () => {}
      );
      
      if (mountedRef.current) {
        setCameraActive(true);
        setError(null);
        console.log("Camera started with user-facing mode");
        return true;
      }
      return false;
    } catch (err) {
      console.log("User-facing camera failed:", err);
      
      // If that fails, try with no specific camera configuration
      if (mountedRef.current && scannerRef.current) {
        try {
          console.log("Trying with default camera...");
          await scannerRef.current.start(
            true, // Use any available camera
            config,
            qrCodeSuccessCallback,
            () => {}
          );
          
          if (mountedRef.current) {
            setCameraActive(true);
            setError(null);
            console.log("Camera started with default settings");
            return true;
          }
        } catch (fallbackErr) {
          console.error("Default camera also failed:", fallbackErr);
        }
      }
      
      if (mountedRef.current) {
        setError("Camera access failed. Please check camera permissions and try again.");
      }
      return false;
    }
  }, [scannerRef, mountedRef, onScanSuccess, stopCamera, setCameraActive, setError]);

  // Setup camera timeout to handle permission issues
  const setupCameraTimeout = useCallback((cameraActive: boolean) => {
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && !cameraActive) {
        setError("Camera access timed out. Please ensure camera permissions are enabled and try again.");
      }
    }, 15000); // Longer timeout
    
    return timeoutId;
  }, [mountedRef, setError]);

  // Handles camera errors and tries fallback options
  const handleCameraError = useCallback((err: any, currentAttempt: number) => {
    console.error("Error starting QR scanner:", err);
    
    if (!mountedRef.current) return;
    
    if (err.toString().includes("permission")) {
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
    } else if (err.toString().includes("object should have exactly 1 key")) {
      // Special handling for camera configuration error
      setError("Camera initialization failed. Trying alternative approach...");
      // A config error will already trigger the fallback in startScanner
    } else if (err.toString().includes("NotFoundError") || err.toString().includes("no camera available")) {
      setError("No camera found. Please ensure your device has a working camera.");
    } else {
      setError("Could not access the camera. Please check permissions and try again.");
    }
  }, [mountedRef, setError]);

  return {
    tryFallbackCamera,
    setupCameraTimeout,
    handleCameraError
  };
};
