
import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerCoreProps {
  onScanSuccess: (decodedText: string) => void;
  onError: (error: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  setCameraActive: (active: boolean) => void;
}

const ScannerCore = ({ 
  onScanSuccess, 
  onError, 
  isScanning, 
  setIsScanning,
  setCameraActive 
}: ScannerCoreProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerContainerId);

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (scannerRef.current && !isScanning) {
      startScanner();
    }
  }, [scannerRef.current]);

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setIsScanning(true);
    setCameraActive(true);

    try {
      const qrCodeSuccessCallback = (decodedText: string) => {
        onScanSuccess(decodedText);
        
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
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setIsScanning(false);
      setCameraActive(false);
      onError("Could not access the camera. Please ensure camera permissions are enabled.");
      console.error("Error starting QR scanner:", err);
    }
  };

  return (
    <div id={scannerContainerId} />
  );
};

export default ScannerCore;
