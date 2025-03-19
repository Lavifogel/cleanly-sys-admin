
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
          
          // First, ensure the container element exists
          const containerElement = document.getElementById(scannerContainerId);
          if (!containerElement) {
            console.log(`Container element '${scannerContainerId}' not found, will try again later`);
            return;
          }
          
          // Clean up any existing HTML5QrCode elements to prevent conflicts
          const existingElements = document.querySelectorAll('.html5-qrcode-element');
          existingElements.forEach(element => {
            if (element.parentNode) {
              try {
                element.parentNode.removeChild(element);
              } catch (e) {
                console.log("Error removing existing scanner element:", e);
              }
            }
          });
          
          // Create a new instance with verbose logging turned off
          scannerRef.current = new Html5Qrcode(scannerContainerId, { verbose: false });
          isInitializedRef.current = true;
          setIsInitialized(true);
          console.log("HTML5QrCode instance created successfully");
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
