import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface StartShiftCardProps {
  onStartShift: () => void;
}

const StartShiftCard = ({ onStartShift }: StartShiftCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (error: any) {
        console.log("Camera permission check failed:", error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setHasPermission(false);
        } else {
          setHasPermission(null);
        }
      }
    };
    
    checkCameraPermission();
    
    return () => {
      stopAllVideoStreams();
    };
  }, []);
  
  const handleStartShift = async () => {
    setIsLoading(true);
    
    if (hasPermission === false) {
      toast({
        title: "Camera access denied",
        description: "Please enable camera permissions in your browser settings.",
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }
    
    try {
      setTimeout(() => {
        onStartShift();
        toast({
          title: "QR Scanner opening",
          description: "Please scan a QR code to start your shift.",
          duration: 3000,
        });
        setIsLoading(false);
      }, 100);
    } catch (error: any) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start shift. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Start Your Shift</CardTitle>
        <CardDescription>
          Scan a QR code to begin your work day
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-6 bg-primary/10 p-6 rounded-full">
          <Scan className="h-16 w-16 text-primary/80" />
        </div>
        
        {hasPermission === false && (
          <div className="mb-4 p-2 bg-destructive/10 text-destructive rounded text-sm text-center">
            Camera access is blocked. Please enable camera permissions in your browser settings.
          </div>
        )}
        
        <Button 
          onClick={handleStartShift} 
          className="w-full text-lg py-6" 
          size="lg"
          disabled={isLoading}
        >
          <Camera className="mr-2 h-5 w-5" />
          {isLoading ? "Opening Scanner..." : "Scan to Start Shift"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartShiftCard;
