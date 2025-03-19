
import { useCallback, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseCameraInitiatorProps {
  scannerRef: React.MutableRefObject<Html5Qrcode | null>;
  scannerContainerId: string;
  mountedRef: React.MutableRefObject<boolean>;
  setIsScanning: (value: boolean) => void;
  setError: (error: string | null) => void;
  isScanning: boolean;
  incrementAttempt: () => number;
}

export const useCameraInitiator = ({
  scannerRef,
  scannerContainerId,
  mountedRef,
  setIsScanning,
  setError,
  isScanning,
  incrementAttempt
}: UseCameraInitiatorProps) => {
  // Track whether scanner is in the process of starting
  const isStartingRef = useRef(false);

  // Initialize scanner state
  const initializeScanner = useCallback(async () => {
    // Prevent duplicate start attempts
    if (isStartingRef.current || !scannerRef.current || !mountedRef.current) {
      console.log("Skipping camera start: already starting or not mounted");
      return false;
    }

    // Mark as starting
    isStartingRef.current = true;
    
    // Increase attempt counter
    const currentAttempt = incrementAttempt();
    console.log(`Starting QR scanner (attempt ${currentAttempt})...`);

    try {
      // First, make sure any existing camera is stopped (but don't reset camera active state)
      if (scannerRef.current && isScanning) {
        try {
          await scannerRef.current.stop();
          console.log("Stopped existing scanner instance before restart");
        } catch (err) {
          console.log("Error stopping existing scanner:", err);
        }
      }

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mountedRef.current) {
        isStartingRef.current = false;
        return false;
      }
      
      setIsScanning(true);
      setError(null);
      
      return true;
    } catch (err) {
      console.error("Error initializing scanner:", err);
      isStartingRef.current = false;
      return false;
    }
  }, [scannerRef, isScanning, mountedRef, setIsScanning, setError, incrementAttempt]);

  // Reset the starting state
  const resetStartingState = useCallback(() => {
    isStartingRef.current = false;
  }, []);

  // Check if the scanner is currently starting
  const isStarting = useCallback(() => {
    return isStartingRef.current;
  }, []);

  return {
    initializeScanner,
    resetStartingState,
    isStarting
  };
};
