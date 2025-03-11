
import { useState } from "react";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");

  const openScanner = (purpose: ScannerPurpose) => {
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };

  const closeScanner = () => {
    setShowQRScanner(false);
  };

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  };
}
