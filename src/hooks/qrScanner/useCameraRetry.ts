
import { useEffect } from "react";

interface UseCameraRetryProps {
  isScanning: boolean;
  cameraActive: boolean;
  mountedRef: React.MutableRefObject<boolean>;
  isStarting: () => boolean;
  startScanner: () => Promise<void>;
}

export const useCameraRetry = ({
  isScanning,
  cameraActive,
  mountedRef,
  isStarting,
  startScanner
}: UseCameraRetryProps) => {
  // Improved retry mechanism for scanner initialization
  useEffect(() => {
    let retryTimeoutId: number | null = null;
    
    if (isScanning && !cameraActive && mountedRef.current && !isStarting()) {
      retryTimeoutId = window.setTimeout(() => {
        if (isScanning && !cameraActive && mountedRef.current && !isStarting()) {
          console.log("Camera not active after timeout, attempting restart...");
          startScanner();
        }
      }, 2000);
    }
    
    return () => {
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [isScanning, cameraActive, startScanner, mountedRef, isStarting]);
};
