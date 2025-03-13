
import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseCameraControlsProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useCameraControls = ({ onScanSuccess }: UseCameraControlsProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  // Stop camera function - improved to ensure complete cleanup
  const stopCamera = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        console.log("Camera stopped successfully from scanner");
      }
      
      // Additional cleanup to ensure all camera resources are released
      stopAllVideoStreams();
      
      setIsScanning(false);
      setCameraActive(false);
    } catch (error) {
      console.error("Error stopping camera:", error);
      // Even if there's an error, still try to stop all video streams as a fallback
      stopAllVideoStreams();
    }
  };

  // Start scanner function
  const startScanner = async () => {
    if (!scannerRef.current) return;

    // First, make sure any existing camera is stopped
    await stopCamera();

    setIsScanning(true);
    setError(null);
    setCameraActive(true);

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
      setIsScanning(false);
      setCameraActive(false);
      setError("Could not access the camera. Please ensure camera permissions are enabled.");
      console.error("Error starting QR scanner:", err);
    }
  };

  return {
    cameraActive,
    isScanning,
    error,
    scannerRef,
    scannerContainerId,
    stopCamera,
    startScanner,
    setError
  };
};
