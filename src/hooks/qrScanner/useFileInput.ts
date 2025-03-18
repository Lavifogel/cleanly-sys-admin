
import { useRef, useState, useCallback } from "react";
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

  const handleTakePicture = useCallback(() => {
    setIsTakingPicture(true);
    if (fileInputRef.current) {
      // Reset the input value to ensure the change event fires even if selecting the same file
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setIsTakingPicture(false);
      return;
    }

    const imageFile = files[0];
    
    // Check file size before scanning - reject files over 5MB
    if (imageFile.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please select an image smaller than 5MB.");
      setIsTakingPicture(false);
      return;
    }
    
    try {
      if (scannerRef.current) {
        // Stop live scanning if it's active
        if (isScanning) {
          await stopCamera();
        }

        // Scan the QR code from the image with a timeout
        const scanPromise = scannerRef.current.scanFile(imageFile, true);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Scanning timed out")), 5000)
        );
        
        const result = await Promise.race([scanPromise, timeoutPromise]);
        onScanSuccess(result);
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      setError("Could not detect a QR code in the image. Please try again with a clearer image.");
      
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
  }, [onScanSuccess, stopCamera, startScanner, isScanning, setError]);

  return {
    isTakingPicture,
    fileInputRef,
    handleTakePicture,
    handleFileSelect
  };
};
