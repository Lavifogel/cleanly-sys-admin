
import { useEffect, useRef } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const processingQRScanRef = useRef(false);
  const { toast } = useToast();
  
  // Force cleanup when visibility changes
  useEffect(() => {
    if (!showQRScanner) {
      // Ensure camera cleanup when scanner is closed
      stopAllVideoStreams();
      processingQRScanRef.current = false;
    } else {
      // First cleanup any existing streams before opening scanner
      stopAllVideoStreams();
      processingQRScanRef.current = false;
    }
  }, [showQRScanner]);
  
  // Force cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("QRScannerHandler unmounting, final cleanup");
    };
  }, []);
  
  // If scanner is not visible, don't render anything
  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scan handling
    if (processingQRScanRef.current) {
      console.log("Already processing a QR scan, ignoring duplicate");
      return;
    }
    
    processingQRScanRef.current = true;
    console.log("QR scan successful, data:", decodedText);
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Notify user
    toast({
      title: "QR Code detected",
      description: "Processing your scan...",
      duration: 2000,
    });
    
    // Allow a moment for cleanup before closing
    setTimeout(() => {
      closeScanner();
      // And then a moment more before processing the scan result
      setTimeout(() => {
        onQRScan(decodedText);
      }, 300);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              stopAllVideoStreams();
              setTimeout(closeScanner, 300);
            }} 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <QRCodeScanner 
        onScanSuccess={handleScanSuccess}
        onClose={() => {
          // Only allow closing if it's the initial scanner
          if (canClose) {
            // Ensure camera is stopped before closing
            stopAllVideoStreams();
            // Allow a moment for cleanup before closing
            setTimeout(closeScanner, 300);
          }
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
