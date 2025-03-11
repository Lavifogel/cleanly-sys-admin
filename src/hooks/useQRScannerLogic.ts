
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRScannerStates } from "@/types/qrScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export const useQRScannerLogic = (
  onScanSuccess: (decodedText: string) => void,
  onClose: () => void
) => {
  const [scannerState, setScannerState] = useState<QRScannerStates>({
    isScanning: false,
    error: null,
    isTakingPicture: false,
    cameraActive: false,
    simulationActive: false,
    simulationProgress: 0
  });
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "qr-scanner-container";

  // Initialize the scanner when component mounts
  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    // Clean up when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  // Start scanning when the scanner is initialized
  useEffect(() => {
    if (scannerRef.current && !scannerState.isScanning) {
      startScanner();
    }
  }, [scannerRef.current]);

  // Handle simulation progress
  useEffect(() => {
    let interval: number | undefined;
    
    if (scannerState.simulationActive && scannerState.simulationProgress < 100) {
      interval = window.setInterval(() => {
        setScannerState(prev => {
          const newProgress = prev.simulationProgress + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            // Simulate a successful scan after reaching 100%
            setTimeout(() => {
              // Generate a mock QR code data based on our use case
              const mockData = `location=Conference Room ${Math.floor(Math.random() * 10) + 1}&timestamp=${Date.now()}`;
              onScanSuccess(mockData);
            }, 500);
            return { ...prev, simulationProgress: 100 };
          }
          return { ...prev, simulationProgress: newProgress };
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scannerState.simulationActive, scannerState.simulationProgress, onScanSuccess]);

  // Stop camera function
  const stopCamera = async () => {
    try {
      if (scannerRef.current && scannerState.isScanning) {
        await scannerRef.current.stop();
        console.log("Camera stopped successfully");
      }
      
      // Additional cleanup to ensure all camera resources are released
      stopAllVideoStreams();
      
      setScannerState(prev => ({
        ...prev,
        isScanning: false,
        cameraActive: false
      }));
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  // Start scanner function
  const startScanner = async () => {
    if (!scannerRef.current) return;

    // First, make sure any existing camera is stopped
    await stopCamera();

    setScannerState(prev => ({
      ...prev,
      isScanning: true,
      error: null,
      cameraActive: true
    }));

    try {
      const qrCodeSuccessCallback = (decodedText: string) => {
        // Handle the scanned code here
        onScanSuccess(decodedText);
        
        // Stop scanning after successful scan
        stopCamera();
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
      setScannerState(prev => ({
        ...prev,
        isScanning: false,
        cameraActive: false,
        error: "Could not access the camera. Please ensure camera permissions are enabled."
      }));
      console.error("Error starting QR scanner:", err);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleTakePicture = () => {
    setScannerState(prev => ({ ...prev, isTakingPicture: true }));
    // For real environments, we would use the file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    
    // For simulation (when no real QR code is available)
    setScannerState(prev => ({ 
      ...prev,
      simulationActive: true,
      simulationProgress: 0
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setScannerState(prev => ({ ...prev, isTakingPicture: false }));
      return;
    }

    const imageFile = files[0];
    
    try {
      if (scannerRef.current) {
        // Stop live scanning if it's active
        if (scannerState.isScanning) {
          await stopCamera();
        }

        // Scan the QR code from the image
        const result = await scannerRef.current.scanFile(imageFile, true);
        onScanSuccess(result);
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      setScannerState(prev => ({
        ...prev,
        error: "Could not detect a QR code in the image. Please try again."
      }));
      
      // Restart live scanning
      if (scannerRef.current && !scannerState.isScanning) {
        startScanner();
      }
    } finally {
      setScannerState(prev => ({ ...prev, isTakingPicture: false }));
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleManualSimulation = () => {
    // This is for demonstration only - simulates a successful scan
    setScannerState(prev => ({
      ...prev,
      simulationActive: true,
      simulationProgress: 0
    }));
  };

  return {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation
  };
};
