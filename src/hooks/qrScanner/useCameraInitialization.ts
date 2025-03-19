
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

  // Create the scanner instance with improved reliability
  useEffect(() => {
    const mountedRef = { current: true };
    
    // Attempt to initialize immediately
    const attemptInit = () => {
      try {
        if (!scannerRef.current && mountedRef.current) {
          console.log("Attempting to initialize HTML5QrCode instance");
          
          // First, ensure the container element exists or create it
          let containerElement = document.getElementById(scannerContainerId);
          if (!containerElement) {
            console.log(`Container element '${scannerContainerId}' not found, creating it`);
            containerElement = document.createElement('div');
            containerElement.id = scannerContainerId;
            containerElement.style.position = 'absolute';
            containerElement.style.visibility = 'hidden';
            document.body.appendChild(containerElement);
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
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error initializing scanner:", error);
        return false;
      }
    };
    
    // Try immediately
    if (!attemptInit()) {
      // If initial attempt fails, try again with delay
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && !scannerRef.current) {
          attemptInit();
        }
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      mountedRef.current = false;
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
