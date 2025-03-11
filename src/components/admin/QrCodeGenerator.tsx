
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Printer, 
  Eye, 
  X,
  Check,
  Download
} from "lucide-react";
import QRCode from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";

const QrCodeGenerator = () => {
  const { toast } = useToast();
  const [areaName, setAreaName] = useState("");
  const [qrType, setQrType] = useState("Cleaning");
  const [generatedQrCodes, setGeneratedQrCodes] = useState([
    { id: "1", areaName: "Conference Room A", type: "Cleaning", areaId: "conference-room-a-1234abcd" },
    { id: "2", areaName: "Main Office", type: "Cleaning", areaId: "main-office-5678efgh" },
    { id: "3", areaName: "Main Entrance", type: "Shift", areaId: "main-entrance-9012ijkl" },
  ]);
  const [showQrCode, setShowQrCode] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<{ id: string; areaName: string; type: string; areaId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const fetchQrCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedQrCodes = data.map(qr => ({
          id: qr.id,
          areaName: qr.area_name,
          type: qr.type,
          areaId: qr.area_id
        }));
        setGeneratedQrCodes(formattedQrCodes);
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast({
        title: "Error",
        description: "Failed to load QR codes",
        variant: "destructive",
      });
    }
  };

  // Fetch QR codes on component mount
  useState(() => {
    fetchQrCodes();
  }, []);

  const handleGenerateQR = async () => {
    if (!areaName) {
      toast({
        title: "Error",
        description: "Please enter an area name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the function to generate a unique area_id
      const { data: functionData, error: functionError } = await supabase
        .rpc('generate_area_id', { area_name: areaName });

      if (functionError) throw functionError;

      const areaId = functionData || `${areaName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
      
      // Save to database
      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          area_name: areaName,
          type: qrType,
          area_id: areaId
        })
        .select()
        .single();

      if (error) throw error;

      const newQrCode = {
        id: data.id,
        areaName: data.area_name,
        type: data.type,
        areaId: data.area_id
      };

      setGeneratedQrCodes([newQrCode, ...generatedQrCodes]);
      setCurrentQrCode(newQrCode);
      setShowQrCode(true);
      setAreaName("");

      toast({
        title: "QR Code Generated",
        description: `QR code for ${areaName} has been created successfully`,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowQR = (qrCode) => {
    setCurrentQrCode(qrCode);
    setShowQrCode(true);
  };

  const handlePrintQR = (qrCode) => {
    setCurrentQrCode(qrCode);
    
    // Use setTimeout to ensure the QR code is rendered before printing
    setTimeout(() => {
      if (qrCodeRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print QR Code</title>
                <style>
                  body { 
                    font-family: system-ui, sans-serif;
                    padding: 20px;
                    text-align: center;
                  }
                  .qr-container {
                    margin: 0 auto;
                    max-width: 400px;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                  }
                  h2 { margin-bottom: 8px; }
                  p { color: #666; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <div class="qr-container">
                  <h2>${qrCode.areaName}</h2>
                  <p>Type: ${qrCode.type}</p>
                  ${qrCodeRef.current.innerHTML}
                </div>
                <script>
                  window.onload = function() { window.print(); window.close(); }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    }, 200);

    toast({
      title: "Printing QR Code",
      description: "The QR code is being sent to the printer",
    });
  };

  const handleDownloadQR = () => {
    if (!currentQrCode) return;
    
    const canvas = document.querySelector('#qr-code-display canvas');
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qrcode-${currentQrCode.areaName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: "The QR code image has been downloaded",
    });
  };

  const closeQrCodeModal = () => {
    setShowQrCode(false);
    setCurrentQrCode(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="area-name" className="text-right">
            Area Name
          </Label>
          <Input
            id="area-name"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            className="col-span-3"
            placeholder="e.g. Conference Room A"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="qr-type" className="text-right">
            QR Code Type
          </Label>
          <Select value={qrType} onValueChange={setQrType}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Shift">Shift</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button 
        onClick={handleGenerateQR} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate QR Code"}
      </Button>

      {showQrCode && currentQrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">QR Code</h3>
              <Button variant="ghost" size="icon" onClick={closeQrCodeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div 
              ref={qrCodeRef} 
              className="flex flex-col items-center justify-center mb-6"
              id="qr-code-display"
            >
              <QRCode 
                value={JSON.stringify({
                  areaId: currentQrCode.areaId,
                  areaName: currentQrCode.areaName,
                  type: currentQrCode.type
                })}
                size={200}
                level="H"
                includeMargin
              />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {currentQrCode.areaName} ({currentQrCode.type})
              </p>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => handlePrintQR(currentQrCode)}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadQR}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium">Generated QR Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generatedQrCodes.map((qrCode) => (
            <div
              key={qrCode.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{qrCode.areaName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Type: {qrCode.type}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShowQR(qrCode)}
                  title="View QR code"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePrintQR(qrCode)}
                  title="Print QR code"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
