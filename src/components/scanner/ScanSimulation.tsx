
import React from "react";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";

interface ScanSimulationProps {
  onSimulate: () => void;
  isActive: boolean;
  progress: number;
}

const ScanSimulation = ({ onSimulate, isActive, progress }: ScanSimulationProps) => {
  return (
    <>
      <Button 
        onClick={onSimulate} 
        variant="outline" 
        disabled={isActive}
        className="flex items-center gap-2"
      >
        <Scan className="h-5 w-5" />
        Simulate Scan (For Testing)
      </Button>
      
      {isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <Scan className="h-16 w-16 animate-pulse" />
          <div className="w-64 bg-gray-700 rounded-full h-4 mt-4">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm">Scanning QR code... {progress}%</p>
        </div>
      )}
    </>
  );
};

export default ScanSimulation;
