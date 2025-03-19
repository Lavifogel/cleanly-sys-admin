
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { useQRScannerHandlers } from "@/hooks/useQRScannerHandlers";
import { useRef } from "react";

export function useQrScanHandlers({
  onStartShiftScan,
  onEndShiftScan,
  onStartCleaningScan,
  onEndCleaningScan,
  setActiveTab
}: {
  onStartShiftScan: (qrData: string) => void;
  onEndShiftScan: (qrData: string) => void;
  onStartCleaningScan: (qrData: string) => void;
  onEndCleaningScan: (qrData: string) => void;
  setActiveTab: (tab: string) => void;
}) {
  const processingRef = useRef(false);
  
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan,
    onEndShiftScan,
    onStartCleaningScan,
    onEndCleaningScan: (qrData: string) => {
      console.log("Handling end cleaning scan in useQrScanHandlers:", qrData);
      if (processingRef.current) {
        console.log("Already processing a scan");
        return;
      }
      
      processingRef.current = true;
      
      // Call the actual handler with the QR data
      onEndCleaningScan(qrData);
      
      // Reset the processing flag after a delay
      setTimeout(() => {
        processingRef.current = false;
      }, 2000);
    },
    setActiveTab
  });

  const {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  } = qrScannerHandlers;
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
