
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageBlob: Blob) => void;
}

const CameraCapture = ({ open, onOpenChange, onCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // Start the camera when the dialog opens
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, [open]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraReady(false);
      onOpenChange(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      stopAllVideoStreams();
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };
  
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && isCameraReady) {
      // Set canvas dimensions to match video
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
            onOpenChange(false);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };
  
  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center justify-between">
          <DialogTitle>Take Photo</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="relative bg-black">
          <video 
            ref={videoRef}
            className="w-full h-auto"
            autoPlay 
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <DialogFooter className="p-4">
          <Button 
            className="w-full flex items-center justify-center"
            disabled={!isCameraReady}
            onClick={handleCapture}
          >
            <Camera className="h-5 w-5 mr-2" />
            Capture Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;
