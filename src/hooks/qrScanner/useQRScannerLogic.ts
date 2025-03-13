
import { useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useCameraControls } from "./useCameraControls";
import { useFileInput } from "./useFileInput";
import { useSimulation } from "./useSimulation";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseQRScannerLogicProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useQRScannerLogic = ({ onScanSuccess }: UseQRScannerLogicProps) => {
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const {
    cameras,
    selectedCamera,
    isLoading: isCameraLoading,
    hasCameraPermission,
    loadCameras,
    selectCamera
  } = useCameraControls();

  const {
    fileInputRef,
    handleFileInputChange,
    triggerFileInput
  } = useFileInput({ onScanSuccess });

  const {
    simulationActive,
    simulationProgress,
    startSimulation,
    resetSimulation
  } = useSimulation({ onScanSuccess });

  // Initialize QR scanner
  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode("qrScanner");
    setHtml5QrCode(qrCodeScanner);

    return () => {
      if (qrCodeScanner.isScanning) {
        qrCodeScanner.stop().catch(error => {
          console.error("Error stopping scanner on unmount:", error);
        });
      }
      stopAllVideoStreams();
    };
  }, []);

  // Start scanning with camera
  const startScan = useCallback(async () => {
    if (!html5QrCode || !selectedCamera || isScanning) return;

    setIsScanning(true);
    setScanError(null);

    try {
      await html5QrCode.start(
        selectedCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          html5QrCode.stop().catch(console.error);
          onScanSuccess(decodedText);
          setIsScanning(false);
        },
        (errorMessage) => {
          console.info("QR code parse error, error =", errorMessage);
        }
      );
    } catch (err) {
      setIsScanning(false);
      setScanError(`Failed to start scanner: ${err instanceof Error ? err.message : String(err)}`);
      console.error("Error starting QR scanner:", err);
    }
  }, [html5QrCode, selectedCamera, isScanning, onScanSuccess]);

  // Stop scanning
  const stopScan = useCallback(async () => {
    if (!html5QrCode || !isScanning) return;

    try {
      await html5QrCode.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Error stopping QR scanner:", err);
    }

    // Ensure all video streams are stopped
    stopAllVideoStreams();
  }, [html5QrCode, isScanning]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
      stopAllVideoStreams();
    };
  }, [html5QrCode]);

  return {
    // Camera-related props
    cameras,
    selectedCamera,
    isCameraLoading,
    hasCameraPermission,
    loadCameras,
    selectCamera,
    
    // Scanning state
    isScanning,
    scanError,
    startScan,
    stopScan,
    
    // File input related props
    fileInputRef,
    handleFileInputChange,
    triggerFileInput,
    
    // Simulation related props
    simulationActive,
    simulationProgress,
    startSimulation,
    resetSimulation
  };
};
