
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Camera, Scan } from "lucide-react";

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
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize the scanner when component mounts
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    // Clean up when component unmounts
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    // Start scanning when the component is mounted
    if (scannerRef.current && !isScanning) {
      startScanner();
    }
  }, [scannerRef.current]);

  // Simulation effect for when we don't have real QR codes
  useEffect(() => {
    let interval: number | undefined;
    
    if (simulationActive && simulationProgress < 100) {
      interval = window.setInterval(() => {
        setSimulationProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            // Simulate a successful scan after reaching 100%
            setTimeout(() => {
              // Generate a mock QR code data based on our use case
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

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setIsScanning(true);
    setError(null);
    setCameraActive(true);

    try {
      const qrCodeSuccessCallback = (decodedText: string) => {
        // Handle the scanned code here
        onScanSuccess(decodedText);
        
        // Stop scanning after successful scan
        if (scannerRef.current) {
          scannerRef.current.stop().catch(error => {
            console.error("Error stopping scanner after success:", error);
          });
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use the back camera
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // QR Code scanning failed or was canceled
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setIsScanning(false);
      setCameraActive(false);
      setError("Could not access the camera. Please ensure camera permissions are enabled.");
      console.error("Error starting QR scanner:", err);
    }
  };

  const handleClose = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().catch(error => {
        console.error("Error stopping scanner on close:", error);
      });
    }
    onClose();
  };

  const handleTakePicture = () => {
    setIsTakingPicture(true);
    // For real environments, we would use the file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    
    // For simulation (when no real QR code is available)
    setSimulationActive(true);
    setSimulationProgress(0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setIsTakingPicture(false);
      return;
    }

    const imageFile = files[0];
    
    try {
      if (scannerRef.current) {
        // Stop live scanning if it's active
        if (isScanning) {
          await scannerRef.current.stop();
          setIsScanning(false);
        }

        // Scan the QR code from the image
        const result = await scannerRef.current.scanFile(imageFile, true);
        onScanSuccess(result);
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      setError("Could not detect a QR code in the image. Please try again.");
      
      // Restart live scanning
      if (scannerRef.current && !isScanning) {
        startScanner();
      }
    } finally {
      setIsTakingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleManualSimulation = () => {
    // This is for demonstration only - simulates a successful scan
    setSimulationActive(true);
    setSimulationProgress(0);
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">Position the QR code within the frame or take a picture</p>
        </div>
        
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
        
        {error && (
          <div className="mt-4 text-destructive text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button 
            onClick={handleTakePicture} 
            className="flex items-center gap-2"
            disabled={isTakingPicture || simulationActive}
          >
            <Camera className="h-5 w-5" />
            {isTakingPicture ? "Processing..." : "Take Picture"}
          </Button>
          
          <Button 
            onClick={handleManualSimulation} 
            variant="outline" 
            disabled={simulationActive}
            className="flex items-center gap-2"
          >
            <Scan className="h-5 w-5" />
            Simulate Scan (For Testing)
          </Button>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
