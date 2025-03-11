
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

interface QrCodeFormProps {
  onGenerateQR: (areaName: string, qrType: string) => void;
  isLoading: boolean;
}

const QrCodeForm = ({ onGenerateQR, isLoading }: QrCodeFormProps) => {
  const [areaName, setAreaName] = useState("");
  const [qrType, setQrType] = useState("Cleaning");

  const handleSubmit = () => {
    onGenerateQR(areaName, qrType);
    setAreaName("");
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
        onClick={handleSubmit} 
        className="w-full"
        disabled={isLoading || !areaName.trim()}
      >
        {isLoading ? "Generating..." : "Generate QR Code"}
      </Button>
    </div>
  );
};

export default QrCodeForm;
