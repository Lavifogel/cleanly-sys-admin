
import React from "react";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { QRScannerStates } from "@/types/qrScanner";

interface QRScannerControlsProps {
  scannerState: QRScannerStates;
  onTakePicture: () => void;
  onSimulateScan: () => void;
}

const QRScannerControls: React.FC<QRScannerControlsProps> = ({ 
  scannerState, 
  onSimulateScan 
}) => {
  const { simulationActive } = scannerState;
  
  return (
    <div className="mt-6 flex flex-col gap-2">
      <Button 
        onClick={onSimulateScan} 
        variant="outline" 
        disabled={simulationActive}
        className="flex items-center gap-2"
      >
        <Scan className="h-5 w-5" />
        Simulate Scan (For Testing)
      </Button>
    </div>
  );
};

export default QRScannerControls;
