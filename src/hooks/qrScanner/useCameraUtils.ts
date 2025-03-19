
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
  
  // Try fallback camera approach
  const tryFallbackCamera = useCallback(async (config: any, qrCodeSuccessCallback: (decodedText: string) => void) => {
    try {
      if (mountedRef.current && scannerRef.current) {
        console.log("Trying fallback camera approach...");
        
        // Try with user-facing camera
        try {
          await scannerRef.current.start(
            { facingMode: "user" },
            config,
            qrCodeSuccessCallback,
            () => {}
          );
          
          if (mountedRef.current) {
            console.log("User-facing camera started successfully");
            setCameraActive(true);
            setError(null);
            return true;
          }
        } catch (err) {
          console.log("User-facing camera failed, trying with fallback approach");
          
          // Try with a different approach as last resort
          try {
            await scannerRef.current.start(
              { facingMode: { ideal: "environment" } }, // Use an object instead of boolean
              config,
              qrCodeSuccessCallback,
              () => {}
            );
            
            if (mountedRef.current) {
              console.log("Camera started with fallback approach");
              setCameraActive(true);
              setError(null);
              return true;
            }
          } catch (finalErr) {
            console.error("All camera approaches failed");
            throw finalErr;
          }
        }
      }
      return false;
    } catch (fallbackErr) {
      console.error("Fallback camera approaches failed:", fallbackErr);
      if (mountedRef.current) {
        setError("Could not access the camera. Please check camera permissions in your browser settings.");
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
    }, 10000); // Shorter timeout for better UX
    
    return timeoutId;
  }, [mountedRef, setError]);

  // Handles camera errors and tries fallback options
  const handleCameraError = useCallback((err: any, currentAttempt: number) => {
    console.error("Error starting QR scanner:", err);
    
    if (!mountedRef.current) return;
    
    if (err.toString().includes("permission")) {
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
    } else if (err.toString().includes("OverconstrainedError")) {
      setError("Your device doesn't support the required camera mode. Trying alternatives...");
    } else {
      setError("Could not access the camera. Please ensure your device has a working camera.");
    }
  }, [mountedRef, setError]);

  return {
    tryFallbackCamera,
    setupCameraTimeout,
    handleCameraError
  };
};
