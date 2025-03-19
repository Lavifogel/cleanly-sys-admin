
import React, { useEffect, useRef } from "react";
import { Scan } from "lucide-react";
import { QRScannerStates } from "@/types/qrScanner";

interface QRScannerViewProps {
  scannerContainerId: string;
  scannerState: QRScannerStates;
}

const QRScannerView: React.FC<QRScannerViewProps> = ({ 
  scannerContainerId, 
  scannerState 
}) => {
  const { cameraActive, simulationActive, simulationProgress, error } = scannerState;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure the container is visible and has proper dimensions before initializing camera
  useEffect(() => {
    if (containerRef.current) {
      // Force a reflow to ensure the element is rendered
      const rect = containerRef.current.getBoundingClientRect();
      console.log("QR scanner container dimensions:", rect.width, rect.height);
      
      // If dimensions are 0, try to force layout recalculation
      if (rect.width === 0 || rect.height === 0) {
        // Apply explicit dimensions to ensure the container is sizeable
        containerRef.current.style.minWidth = "320px";
        containerRef.current.style.minHeight = "320px";
        containerRef.current.style.width = "100%";
        containerRef.current.style.height = "400px";
        
        // Force a layout recalculation
        setTimeout(() => {
          if (containerRef.current) {
            const newRect = containerRef.current.getBoundingClientRect();
            console.log("Updated container dimensions:", newRect.width, newRect.height);
          }
        }, 100);
      }
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-md rounded-lg overflow-hidden relative bg-gray-900"
      style={{ height: "400px", minHeight: "400px", minWidth: "320px" }} // Increased dimensions for better visibility
    >
      {/* Scanner container with explicit size */}
      <div 
        id={scannerContainerId} 
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ minHeight: "400px", minWidth: "320px" }}
      >
        {/* Inner element to ensure the scanner UI is visible and properly positioned */}
        <div className="relative w-full h-full">
          {/* The Html5Qrcode library will insert the video element here */}
        </div>
      </div>
      
      {!cameraActive && !simulationActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
          <p className="text-white text-sm mb-2">Initializing camera...</p>
          <div className="mt-2 animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
        </div>
      )}
      
      {/* Display error message if present */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70">
          <div className="bg-destructive/10 p-4 rounded-lg max-w-[80%] text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-white text-sm mt-2">Please check your camera permissions and try again</p>
          </div>
        </div>
      )}
      
      {simulationActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20">
          <Scan className="h-16 w-16 animate-pulse" />
          <div className="w-64 bg-gray-700 rounded-full h-4 mt-4">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-300" 
              style={{ width: `${simulationProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm">Scanning QR code... {simulationProgress}%</p>
        </div>
      )}
      
      {cameraActive && !simulationActive && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 border-2 border-primary/30"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 border-dashed animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default QRScannerView;
