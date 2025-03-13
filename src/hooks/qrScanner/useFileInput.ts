
import { useRef, useState } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface UseFileInputProps {
  onScanSuccess: (decodedText: string) => void;
  scannerRef: React.MutableRefObject<any>;
  stopCamera: () => Promise<void>;
  startScanner: () => Promise<void>;
  setError: (error: string | null) => void;
  isScanning: boolean;
}

export const useFileInput = ({ 
  onScanSuccess,
  scannerRef,
  stopCamera,
  startScanner,
  setError,
  isScanning
}: UseFileInputProps) => {
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTakePicture = () => {
    setIsTakingPicture(true);
    if (fileInputRef.current) {
      // Reset the input value to ensure the change event fires even if selecting the same file
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
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
          await stopCamera();
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

  return {
    isTakingPicture,
    fileInputRef,
    handleTakePicture,
    handleFileSelect
  };
};
