
import { useState, useRef, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export interface CameraInitializationState {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  isInitialized: boolean;
  scannerContainerId: string;
  initAttemptCount: number;
}

export const useCameraInitialization = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";
  const initAttemptRef = useRef(0);
  const isInitializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize HTML5QrCode instance only once
  useEffect(() => {
    const mountedRef = { current: true };
    
    // Slight delay to ensure container is ready
    const timeoutId = setTimeout(() => {
      try {
        if (!scannerRef.current && mountedRef.current) {
          console.log("Initializing HTML5QrCode instance");
          scannerRef.current = new Html5Qrcode(scannerContainerId);
          isInitializedRef.current = true;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing scanner:", error);
      }
    }, 500);
    
    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const incrementAttempt = useCallback(() => {
    initAttemptRef.current += 1;
    return initAttemptRef.current;
  }, []);

  return {
    scannerRef,
    scannerContainerId,
    isInitialized: isInitializedRef.current,
    initAttemptCount: initAttemptRef.current,
    incrementAttempt
  };
};
