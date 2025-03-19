
import React from "react";
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
  
  return (
    <div 
      id={scannerContainerId} 
      className={`w-full max-w-md h-80 rounded-lg overflow-hidden relative ${cameraActive ? 'bg-black' : 'bg-gray-100'}`}
    >
      {!cameraActive && !simulationActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Initializing camera...</p>
        </div>
      )}
      
      {simulationActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-primary/30"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 border-dashed"></div>
        </div>
      )}
    </div>
  );
};

export default QRScannerView;
