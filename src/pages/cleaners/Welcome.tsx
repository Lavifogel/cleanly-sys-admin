
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scan } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import { useShift } from "@/hooks/useShift";

const CleanerWelcome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose] = useState<"startShift">("startShift");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { startShift } = useShift();

  const handleStartShift = () => {
    setIsLoading(true);
    try {
      setShowQRScanner(true);
      toast({
        title: "QR Scanner opened",
        description: "Please scan a QR code or use the simulation button.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start shift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (decodedText: string) => {
    setShowQRScanner(false);
    try {
      await startShift(decodedText);
      // Navigate to dashboard after successful shift start
      navigate("/cleaners/dashboard");
    } catch (error: any) {
      console.error("Error starting shift with QR scan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeScanner = () => {
    setShowQRScanner(false);
  };

  // Get navigate function from useNavbar hook
  const goBack = () => {
    window.location.href = '/';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 pt-20"
    >
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={goBack} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>
      
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
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
        </div>
      </div>

      <QRScannerHandler 
        showQRScanner={showQRScanner}
        scannerPurpose={scannerPurpose}
        closeScanner={closeScanner}
        onQRScan={handleQRScan}
      />
    </motion.div>
  );
};

export default CleanerWelcome;
