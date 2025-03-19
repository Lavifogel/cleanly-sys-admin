
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
  const { cameraActive, simulationActive, simulationProgress, isScanning } = scannerState;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure the container is visible and has proper dimensions before initializing camera
  useEffect(() => {
    if (containerRef.current) {
      // Force a reflow to ensure the element is rendered with correct dimensions
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          console.log("QR scanner container dimensions:", rect.width, rect.height);
        }
      }, 0);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-md h-80 rounded-lg overflow-hidden relative bg-black"
      style={{ 
        minHeight: "320px", 
        minWidth: "320px",
        maxHeight: "70vh"
      }}
    >
      {/* This is the actual container where the camera feed will be inserted */}
      <div 
        id={scannerContainerId} 
        className="absolute inset-0 z-10 w-full h-full"
        style={{ minHeight: "320px", minWidth: "320px" }}
      />
      
      {isScanning && !cameraActive && !simulationActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
          <p className="text-white text-sm mb-2">Initializing camera...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent"></div>
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
