
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan } from "lucide-react";
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
      await onStartShift();
    } catch (error) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error",
        description: "Failed to start shift. Please try again.",
        variant: "destructive",
      });
    } finally {
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
          <Scan className="mr-2 h-5 w-5" />
          {isLoading ? "Starting..." : "Scan to Start Shift"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartShiftCard;
