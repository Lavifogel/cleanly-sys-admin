
import { useState, useEffect } from "react";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // Extra safety: ensure camera is released when scanner is closed
      setTimeout(() => {
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
              track.stop();
              console.log("Released camera track from hook:", track.kind);
            });
            video.srcObject = null;
          }
        });
      }, 100); // Small delay to ensure cleanup happens after component unmount
    }
  }, [showQRScanner]);

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
