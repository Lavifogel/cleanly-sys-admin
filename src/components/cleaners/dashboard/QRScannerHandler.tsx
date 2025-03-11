
import { useEffect } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";

interface QRScannerHandlerProps {
  showQRScanner: boolean;
  scannerPurpose: ScannerPurpose;
  closeScanner: () => void;
  onQRScan: (decodedText: string) => void;
}

const QRScannerHandler = ({
  showQRScanner,
  scannerPurpose,
  closeScanner,
  onQRScan
}: QRScannerHandlerProps) => {
  
  // Monitor when the QR scanner is closed and ensure camera is properly released
  useEffect(() => {
    if (!showQRScanner) {
      // Ensure any lingering video tracks are stopped
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log("Stopping track on QR scanner close:", track.kind);
            });
          }
          video.srcObject = null;
        }
      });
    }
  }, [showQRScanner]);

  if (!showQRScanner) return null;

  return (
    <QRCodeScanner 
      onScanSuccess={onQRScan}
      onClose={closeScanner}
    />
  );
};

export default QRScannerHandler;
