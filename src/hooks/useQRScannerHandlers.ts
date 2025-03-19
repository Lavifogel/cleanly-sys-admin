
import { useState, useRef, useCallback, useEffect } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

// Importing ScannerPurpose from useQRScanner instead of qrScanner types
import { ScannerPurpose } from "@/hooks/useQRScanner";

interface ScanHandlerProps {
  onStartShiftScan: (qrData: string) => void;
  onEndShiftScan: (qrData: string) => void;
  onStartCleaningScan: (qrData: string) => void;
  onEndCleaningScan: (qrData: string) => void;
  setActiveTab?: (tab: string) => void;
}

export function useQRScannerHandlers({
  onStartShiftScan,
  onEndShiftScan,
  onStartCleaningScan,
  onEndCleaningScan,
  setActiveTab
}: ScanHandlerProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>('startShift');
  const processingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const attemptCountRef = useRef(0);
  const scannerActiveTimestampRef = useRef<number>(0);
  const closingInProgressRef = useRef(false);
  const scanSuccessRef = useRef(false);
  
  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      stopAllVideoStreams();
    };
  }, []);
  
  const closeScanner = useCallback(() => {
    // Prevent duplicate closing attempts
    if (closingInProgressRef.current) {
      console.log("[useQRScannerHandlers] Closing already in progress, ignoring duplicate request");
      return;
    }
    
    // Mark closing as in progress
    closingInProgressRef.current = true;
    
    // Prevent closing the scanner if it's been open for less than 2 seconds
    // This prevents the rapid open/close cycle
    const currentTime = Date.now();
    const timeSinceOpen = currentTime - scannerActiveTimestampRef.current;
    
    if (timeSinceOpen < 2000 && !scanSuccessRef.current) {
      console.log(`[useQRScannerHandlers] Preventing early scanner closure, open for only ${timeSinceOpen}ms`);
      closingInProgressRef.current = false;
      return;
    }
    
    // Clear any pending timers
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    console.log(`[useQRScannerHandlers] Closing scanner for purpose: ${scannerPurpose}`);
    
    // Force stop all camera streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Add delay before changing UI state to ensure proper cleanup
    setTimeout(() => {
      setShowQRScanner(false);
      
      // Double-check camera is fully stopped after a delay
      setTimeout(() => {
        stopAllVideoStreams();
        
        // Reset all state flags after a delay
        setTimeout(() => {
          processingRef.current = false;
          attemptCountRef.current = 0;
          closingInProgressRef.current = false;
          scanSuccessRef.current = false;
        }, 1000);
      }, 500);
    }, 300);
  }, [scannerPurpose]);
  
  const handleQRScannerStart = useCallback((purpose: ScannerPurpose) => {
    // Don't start a new scanner if one is already active
    if (showQRScanner) {
      console.log(`[useQRScannerHandlers] Scanner already active (${scannerPurpose}), not starting new one (${purpose})`);
      return;
    }
    
    // Reset processing state
    processingRef.current = false;
    scanSuccessRef.current = false;
    closingInProgressRef.current = false;
    attemptCountRef.current += 1;
    
    console.log(`[useQRScannerHandlers] Starting QR scanner for purpose: ${purpose} (attempt ${attemptCountRef.current})`);
    
    // Set purpose before any async operations
    setScannerPurpose(purpose);
    
    // Ensure any existing camera is fully closed before opening scanner
    stopAllVideoStreams();
    
    // Add longer delay before showing scanner to ensure previous resources are released
    const delay = purpose === "endCleaning" || purpose === "endShift" ? 1200 : 800;
    
    timerRef.current = window.setTimeout(() => {
      // Additional cleanup right before opening
      stopAllVideoStreams();
      
      setTimeout(() => {
        // Record when the scanner is activated
        scannerActiveTimestampRef.current = Date.now();
        setShowQRScanner(true);
        console.log(`[useQRScannerHandlers] QR scanner opened for purpose: ${purpose}`);
      }, 500);
    }, delay);
  }, [showQRScanner, scannerPurpose]);
  
  const handleQRScan = useCallback((decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("[useQRScannerHandlers] Already processing a scan result, ignoring duplicate");
      return;
    }
    
    // Prevent processing if scanner has been open for less than 1 second
    // This helps prevent false triggers right after opening
    const currentTime = Date.now();
    const scannerOpenDuration = currentTime - scannerActiveTimestampRef.current;
    
    if (scannerOpenDuration < 1000) {
      console.log(`[useQRScannerHandlers] Ignoring scan, scanner only open for ${scannerOpenDuration}ms`);
      return;
    }
    
    // Mark that we're processing a scan and it was successful
    processingRef.current = true;
    scanSuccessRef.current = true;
    
    console.log(`[useQRScannerHandlers] Processing QR scan for purpose: ${scannerPurpose}, data: ${decodedText}`);
    
    // Immediately stop all camera streams
    stopAllVideoStreams();
    
    // Hide scanner UI - only after successful scan
    setShowQRScanner(false);
    
    // Add a longer delay before processing the scan result
    // This ensures camera resources are fully released
    const processingDelay = 1200;
    
    timerRef.current = window.setTimeout(() => {
      try {
        // Force stop camera streams again to ensure complete cleanup
        stopAllVideoStreams();
        
        console.log(`[useQRScannerHandlers] Executing handler for ${scannerPurpose}`);
        
        switch (scannerPurpose) {
          case 'startShift':
            onStartShiftScan(decodedText);
            break;
          case 'endShift':
            onEndShiftScan(decodedText);
            break;
          case 'startCleaning':
            console.log("[useQRScannerHandlers] Calling startCleaning handler with data:", decodedText);
            onStartCleaningScan(decodedText);
            // Switch to cleaning tab after starting a cleaning
            if (setActiveTab) {
              setActiveTab('cleaning');
            }
            break;
          case 'endCleaning':
            console.log("[useQRScannerHandlers] Calling endCleaning handler with data:", decodedText);
            onEndCleaningScan(decodedText);
            break;
          default:
            console.log("[useQRScannerHandlers] Unknown scanner purpose:", scannerPurpose);
            break;
        }
      } catch (error) {
        console.error("[useQRScannerHandlers] Error processing QR scan:", error);
      } finally {
        // Final camera cleanup
        stopAllVideoStreams();
        
        // Reset processing flag with a longer delay
        setTimeout(() => {
          processingRef.current = false;
          closingInProgressRef.current = false;
          attemptCountRef.current = 0;
        }, 1000);
      }
    }, processingDelay);
  }, [scannerPurpose, onStartShiftScan, onEndShiftScan, onStartCleaningScan, onEndCleaningScan, setActiveTab]);
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
