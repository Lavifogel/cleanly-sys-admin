
import { useEffect } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QRScannerHandlerProps {
  showQRScanner: boolean;
  scannerPurpose: ScannerPurpose;
  closeScanner: () => void;
  onQRScan: (decodedText: string) => void;
  activeShift?: boolean;
}

const QRScannerHandler = ({
  showQRScanner,
  scannerPurpose,
  closeScanner,
  onQRScan,
  activeShift = false
}: QRScannerHandlerProps) => {
  
  // Monitor when the QR scanner is shown and ensure it initializes properly
  useEffect(() => {
    let timeoutId: number;
    
    if (showQRScanner) {
      // Force a reflow to ensure the scanner container is ready
      timeoutId = window.setTimeout(() => {
        const container = document.getElementById("qr-scanner-container");
        if (container) {
          console.log("QR scanner container found, dimensions:", 
            container.offsetWidth, container.offsetHeight);
        } else {
          console.log("QR scanner container not found yet");
        }
      }, 300);
    } else {
      // Ensure any lingering video tracks are stopped
      stopAllVideoStreams();
      console.log("Camera resources released when QR scanner hidden");
    }
    
    // Also clean up when unmounting
    return () => {
      window.clearTimeout(timeoutId);
      if (showQRScanner) {
        stopAllVideoStreams();
        console.log("Camera resources released when QR scanner component unmounted");
      }
    };
  }, [showQRScanner]);

  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button variant="ghost" size="icon" onClick={closeScanner} className="bg-background/50 backdrop-blur-sm hover:bg-background/80">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <QRCodeScanner 
        onScanSuccess={(decodedText) => {
          console.log("QR scan successful, data:", decodedText);
          onQRScan(decodedText);
          // Ensure camera is stopped after successful scan
          stopAllVideoStreams();
        }}
        onClose={() => {
          // Only allow closing if it's the initial scanner
          if (canClose) {
            closeScanner();
          }
          // Double-ensure camera is stopped
          stopAllVideoStreams();
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
