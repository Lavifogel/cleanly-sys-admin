
import { Button } from "@/components/ui/button";
import { QrCode, Printer, Eye } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCodeListProps, QrCode as QrCodeType } from "@/types/qrCode";

const QrCodeList = ({ qrCodes, onShowQR, onPrintQR }: QrCodeListProps) => {
  if (qrCodes.length === 0) {
    return (
      <div className="text-center p-4 border rounded-lg">
        <p className="text-muted-foreground">No QR codes generated yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {qrCodes.map((qrCode) => (
        <div
          key={qrCode.id}
          className="border rounded-lg p-4 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {qrCode.qrCodeImageUrl ? (
                <img 
                  src={qrCode.qrCodeImageUrl} 
                  alt="QR Code" 
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <QrCode className="h-8 w-8 text-primary" />
              )}
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
              onClick={() => onShowQR(qrCode)}
              title="View QR code"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPrintQR(qrCode)}
              title="Print QR code"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QrCodeList;
