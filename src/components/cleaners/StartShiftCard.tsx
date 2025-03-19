
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StartShiftCardProps {
  onStartShift: () => void;
}

const StartShiftCard = ({ onStartShift }: StartShiftCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleStartShift = async () => {
    setIsLoading(true);
    try {
      // Clear any existing video streams before opening scanner
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const mediaDevices = navigator.mediaDevices as MediaDevices;
        await mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            console.log("Camera access granted before starting shift");
          })
          .catch(err => {
            console.warn("Could not access camera before start shift:", err);
          });
      }
      
      toast({
        title: "Opening Scanner",
        description: "Camera is initializing...",
        duration: 3000,
      });
      
      // Slight delay to ensure UI updates before opening scanner
      setTimeout(() => {
        onStartShift();
        setIsLoading(false);
      }, 300);
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
