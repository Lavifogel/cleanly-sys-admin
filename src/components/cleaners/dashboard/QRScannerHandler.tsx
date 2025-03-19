
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
  
  // Monitor when the QR scanner is closed and ensure camera is properly released
  useEffect(() => {
    if (!showQRScanner) {
      // Ensure any lingering video tracks are stopped
      stopAllVideoStreams();
      console.log("Camera resources released when QR scanner hidden");
    }
    
    // Also clean up when unmounting
    return () => {
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
    <div className="relative">
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
