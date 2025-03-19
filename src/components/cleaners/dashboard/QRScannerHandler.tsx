
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
      console.log(`Opening QR scanner for purpose: ${scannerPurpose}`);
      // First cleanup any existing streams before opening scanner
      stopAllVideoStreams();
      processingQRScanRef.current = false;
    }
    
    // Always cleanup on dismount
    return () => {
      stopAllVideoStreams();
      console.log("QRScannerHandler useEffect cleanup, stopping video streams");
    };
  }, [showQRScanner, scannerPurpose]);
  
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
    
    // First aggressively stop all camera streams
    stopAllVideoStreams();
    
    // Notify user
    toast({
      title: "QR Code detected",
      description: "Processing your scan...",
      duration: 2000,
    });
    
    // Close scanner immediately to hide camera UI
    closeScanner();
    
    // Process scan after a delay to ensure camera is fully stopped
    setTimeout(() => {
      onQRScan(decodedText);
      // Force one more cleanup after processing the scan
      stopAllVideoStreams();
    }, 800);
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
