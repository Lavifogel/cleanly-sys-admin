
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
  
  // Try fallback camera (user-facing) when main camera fails
  const tryFallbackCamera = useCallback(async (config: any, qrCodeSuccessCallback: (decodedText: string) => void) => {
    try {
      if (mountedRef.current && scannerRef.current) {
        console.log("Trying with user-facing camera...");
        
        await scannerRef.current.start(
          { facingMode: "user" },
          config,
          (decodedText: string) => {
            onScanSuccess(decodedText);
            stopCamera();
          },
          () => {}
        );
        
        if (mountedRef.current) {
          setCameraActive(true);
          setError(null);
          return true;
        }
      }
      return false;
    } catch (fallbackErr) {
      console.error("Fallback camera also failed:", fallbackErr);
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
      // Try with simple configuration
      if (scannerRef.current && mountedRef.current) {
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: ["QR_CODE"]
        };
        tryFallbackCamera(config, (decodedText: string) => {
          onScanSuccess(decodedText);
          stopCamera();
        });
      }
    } else {
      setError("Could not access the camera. Please ensure your device has a working camera.");
      
      // Try with user-facing camera as fallback
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: ["QR_CODE"]
      };
      tryFallbackCamera(config, (decodedText: string) => {
        onScanSuccess(decodedText);
        stopCamera();
      });
    }
  }, [mountedRef, setError, tryFallbackCamera, scannerRef, onScanSuccess, stopCamera]);

  return {
    tryFallbackCamera,
    setupCameraTimeout,
    handleCameraError
  };
};
