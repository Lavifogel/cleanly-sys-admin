
import { useState } from "react";
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
import { QrCode } from "lucide-react";

const QrCodeGenerator = () => {
  const { toast } = useToast();
  const [areaName, setAreaName] = useState("");
  const [qrType, setQrType] = useState("Cleaning");
  const [generatedQrCodes, setGeneratedQrCodes] = useState([
    { id: "1", areaName: "Conference Room A", type: "Cleaning" },
    { id: "2", areaName: "Main Office", type: "Cleaning" },
    { id: "3", areaName: "Main Entrance", type: "Shift" },
  ]);

  const handleGenerateQR = () => {
    if (!areaName) {
      toast({
        title: "Error",
        description: "Please enter an area name",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API to generate and save the QR code
    const newQrCode = {
      id: `${generatedQrCodes.length + 1}`,
      areaName,
      type: qrType,
    };

    setGeneratedQrCodes([...generatedQrCodes, newQrCode]);
    setAreaName("");

    toast({
      title: "QR Code Generated",
      description: `QR code for ${areaName} has been created successfully`,
    });
  };

  const handlePrintQR = (id: string) => {
    toast({
      title: "Printing QR Code",
      description: "The QR code is being sent to the printer",
    });
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
      <Button onClick={handleGenerateQR} className="w-full">
        Generate QR Code
      </Button>

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintQR(qrCode.id)}
              >
                Print
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
