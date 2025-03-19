
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface StartShiftCardProps {
  onStartShift: () => void;
}

const StartShiftCard = ({ onStartShift }: StartShiftCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleStartShift = async () => {
    setIsLoading(true);
    try {
      // First, ensure all existing camera streams are completely stopped
      stopAllVideoStreams();
      
      // A short delay to ensure resources are released
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if camera permission can be obtained
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
          // Request camera permission before opening scanner
          console.log("Requesting camera permission...");
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: "environment" } } 
          });
          
          // If successful, stop the test stream to free the camera for the scanner
          stream.getTracks().forEach(track => {
            track.stop();
            console.log(`Test camera track stopped: ${track.kind}`);
          });
          
          console.log("Camera access granted before starting shift");
          
          toast({
            title: "Opening Scanner",
            description: "Camera is initializing...",
            duration: 3000,
          });
          
          // Longer delay before opening the scanner UI to ensure camera is fully released
          setTimeout(() => {
            onStartShift();
            setIsLoading(false);
          }, 800);
        } catch (err) {
          console.error("Camera permission denied:", err);
          toast({
            title: "Camera Access Denied",
            description: "Please allow camera access to scan QR codes",
            variant: "destructive",
            duration: 5000,
          });
          setIsLoading(false);
        }
      } else {
        toast({
          title: "Camera Not Available",
          description: "Camera access is not available on this device or browser",
          variant: "destructive",
        });
        setIsLoading(false);
      }
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
        <Button 
          onClick={handleStartShift} 
          className="w-full text-lg py-6" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Opening Scanner...
            </>
          ) : (
            <>
              <Scan className="mr-2 h-5 w-5" />
              Scan to Start Shift
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartShiftCard;
