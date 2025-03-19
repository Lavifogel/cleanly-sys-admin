
import { useCallback } from "react";
import { Html5Qrcode, Html5QrcodeConfigs } from "html5-qrcode";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

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
  
  // Try all possible fallback camera approaches
  const tryFallbackCamera = useCallback(async (
    config: Html5QrcodeConfigs,
    qrCodeSuccessCallback: (decodedText: string, result: any) => void
  ) => {
    if (!scannerRef.current || !mountedRef.current) return false;
    
    console.log("Trying final fallback camera approach...");
    
    try {
      // Try a very generic approach that should work on most devices
      await scannerRef.current.start(
        { facingMode: "user" }, // Try user-facing as a last resort
        config,
        qrCodeSuccessCallback,
        () => {}
      );
      
      if (mountedRef.current) {
        console.log("Camera started with user-facing camera");
        setCameraActive(true);
        return true;
      }
    } catch (err) {
      console.error("Final fallback camera approach failed:", err);
      
      if (mountedRef.current) {
        setError("Could not access camera. Please check camera permissions and try again.");
        await stopCamera();
      }
    }
    
    return false;
  }, [scannerRef, mountedRef, setCameraActive, setError, stopCamera]);
  
  // Setup timeout for camera initialization
  const setupCameraTimeout = useCallback((cameraActive: boolean) => {
    if (cameraActive) return undefined;
    
    // Set a timeout to handle if camera doesn't start in a reasonable time
    return setTimeout(async () => {
      if (!mountedRef.current) return;
      
      console.log("Camera start timeout reached!");
      
      if (!scannerRef.current || cameraActive) return;
      
      try {
        // Force stop any existing attempts
        stopAllVideoStreams();
        
        if (mountedRef.current) {
          setError("Camera initialization timed out. Please check your permissions and try again.");
          await stopCamera();
        }
      } catch (e) {
        console.error("Error in camera timeout handler:", e);
      }
    }, 15000); // 15 seconds should be enough for any reasonable camera start
  }, [scannerRef, mountedRef, cameraActive, setError, stopCamera]);
  
  // Handle camera errors
  const handleCameraError = useCallback(async (error: any, attemptNumber: number) => {
    if (!mountedRef.current) return;
    
    console.error(`Camera error (attempt ${attemptNumber}):`, error);
    
    let errorMessage = "Could not access camera.";
    
    // Check for specific error types and provide better error messages
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera access denied. Please check your browser permissions.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found. Please connect a camera and try again.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is in use by another application. Please close other apps using your camera.";
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "Camera does not meet the required constraints. Trying alternative settings.";
      
      // For this specific error, we will try again with different settings
      if (attemptNumber < 3 && mountedRef.current) {
        return; // Let the retry logic handle it
      }
    } else if (error.name === "AbortError") {
      errorMessage = "Camera access was aborted. Please try again.";
    }
    
    // Update error state
    if (mountedRef.current) {
      setError(errorMessage);
      await stopCamera();
    }
  }, [mountedRef, setError, stopCamera]);
  
  return {
    tryFallbackCamera,
    setupCameraTimeout,
    handleCameraError
  };
};
