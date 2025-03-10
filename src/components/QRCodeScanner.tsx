import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import CameraAccess from "./scanner/CameraAccess";
import ScanSimulation from "./scanner/ScanSimulation";
import ScannerCore from "./scanner/ScannerCore";

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  React.useEffect(() => {
    let interval: number | undefined;
    
    if (simulationActive && simulationProgress < 100) {
      interval = window.setInterval(() => {
        setSimulationProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const mockData = `location=Conference Room ${Math.floor(Math.random() * 10) + 1}&timestamp=${Date.now()}`;
              onScanSuccess(mockData);
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive, simulationProgress, onScanSuccess]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setIsTakingPicture(false);
      return;
    }

    setIsTakingPicture(true);
    const imageFile = files[0];
    
    try {
      const html5QrCode = new Html5Qrcode("qr-scanner-container");
      
      if (isScanning) {
        await html5QrCode.stop();
        setIsScanning(false);
      }

      const result = await html5QrCode.scanFile(imageFile, true);
      onScanSuccess(result);
    } catch (error) {
      console.error("Error scanning image:", error);
      setError("Could not detect a QR code in the image. Please try again.");
      
      setIsScanning(true);
    } finally {
      setIsTakingPicture(false);
    }
  };

  const handleManualSimulation = () => {
    setSimulationActive(true);
    setSimulationProgress(0);
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">Position the QR code within the frame or take a picture</p>
        </div>
        
        <div className={`w-full max-w-md h-80 rounded-lg overflow-hidden relative ${cameraActive ? 'bg-black' : 'bg-gray-100'}`}>
          <ScannerCore 
            onScanSuccess={onScanSuccess}
            onError={setError}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            setCameraActive={setCameraActive}
          />
          
          <ScanSimulation 
            onSimulate={handleManualSimulation}
            isActive={simulationActive}
            progress={simulationProgress}
          />
        </div>
        
        {error && (
          <div className="mt-4 text-destructive text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <CameraAccess 
            onFileSelect={handleFileSelect}
            isTakingPicture={isTakingPicture}
            disabled={simulationActive}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
