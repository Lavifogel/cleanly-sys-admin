
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
    </div>
  );
};

export default QRScannerView;
