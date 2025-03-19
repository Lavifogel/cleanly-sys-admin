
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
  const { cameraActive, simulationActive, simulationProgress } = scannerState;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure the container is visible and has proper dimensions before initializing camera
  useEffect(() => {
    if (containerRef.current) {
      // Force a reflow to ensure the element is rendered with proper dimensions
      const rect = containerRef.current.getBoundingClientRect();
      console.log("QR scanner container dimensions:", rect.width, rect.height);
      
      // If dimensions are too small, try to force them to be larger
      if (rect.width < 300 || rect.height < 300) {
        containerRef.current.style.minWidth = "320px";
        containerRef.current.style.minHeight = "384px";
      }
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-md h-96 rounded-lg overflow-hidden relative bg-black"
      style={{ minHeight: "384px", minWidth: "320px" }} // Ensure minimum dimensions
    >
      {/* This is the actual container where the camera feed will be inserted */}
      <div 
        id={scannerContainerId} 
        className="absolute inset-0 z-10 w-full h-full"
      />
      
      {!cameraActive && !simulationActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <p className="text-white text-sm mb-2">Initializing camera...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
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
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm px-4 py-2 bg-black/50 rounded-md mx-auto w-max">
            Position QR code within the square
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerView;
