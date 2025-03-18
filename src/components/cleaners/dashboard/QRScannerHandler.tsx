
import { useEffect, useRef } from "react";
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
  const scannerMounted = useRef(false);
  const prevShowQRScannerRef = useRef(showQRScanner);
  
  // Monitor when the QR scanner is shown and ensure it initializes properly
  useEffect(() => {
    let timeoutId: number;
    
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      scannerMounted.current = true;
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
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      if (scannerMounted.current) {
        // Ensure any lingering video tracks are stopped
        stopAllVideoStreams();
        
        // Wait a moment then perform additional cleanup
        timeoutId = window.setTimeout(() => {
          // Clean up any orphaned video elements
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.parentNode) {
              try {
                video.parentNode.removeChild(video);
              } catch (e) {
                console.log("Cleanup - Could not remove video element:", e);
              }
            }
          });
          
          console.log("Camera resources released when QR scanner hidden");
          scannerMounted.current = false;
        }, 200);
      }
    }
    
    // Update previous state reference
    prevShowQRScannerRef.current = showQRScanner;
    
    // Also clean up when unmounting
    return () => {
      window.clearTimeout(timeoutId);
      if (scannerMounted.current) {
        stopAllVideoStreams();
        
        // Clean up orphaned video elements
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.parentNode) {
            try {
              video.parentNode.removeChild(video);
            } catch (e) {
              console.log("Unmount - Could not remove video element:", e);
            }
          }
        });
        
        console.log("Camera resources released when QR scanner component unmounted");
        scannerMounted.current = false;
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
          // Ensure camera is stopped before handling scan result
          stopAllVideoStreams();
          // Allow a moment for cleanup before processing result
          setTimeout(() => {
            onQRScan(decodedText);
          }, 100);
        }}
        onClose={() => {
          // Only allow closing if it's the initial scanner
          if (canClose) {
            // Ensure camera is stopped before closing
            stopAllVideoStreams();
            // Allow a moment for cleanup before closing
            setTimeout(() => {
              closeScanner();
            }, 100);
          }
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
