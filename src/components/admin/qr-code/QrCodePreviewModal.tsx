
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { QrCodePreviewModalProps, QrCodeData } from "@/types/qrCode";

const QrCodePreviewModal = ({ qrCode, onClose, onPrint }: QrCodePreviewModalProps) => {
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = () => {
    let imageUrl = qrCode.qrCodeImageUrl;
    
    if (!imageUrl) {
      const canvas = document.querySelector('#qr-code-display canvas') as HTMLCanvasElement;
      if (!canvas) return;
      imageUrl = canvas.toDataURL('image/png');
    }
    
    const link = document.createElement('a');
    link.download = `qrcode-${qrCode.areaName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = imageUrl;
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: "The QR code image has been downloaded",
    });
  };

  // Prepare QR code data for dynamic generation if needed
  const qrCodeData: QrCodeData = {
    areaId: qrCode.areaId,
    areaName: qrCode.areaName,
    type: qrCode.type
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">QR Code</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div 
          ref={qrCodeRef} 
          className="flex flex-col items-center justify-center mb-6"
          id="qr-code-display"
        >
          {qrCode.qrCodeImageUrl ? (
            <img 
              src={qrCode.qrCodeImageUrl} 
              alt="QR Code" 
              className="w-48 h-48 object-contain"
            />
          ) : (
            <QRCodeCanvas 
              value={JSON.stringify(qrCodeData)}
              size={200}
              level="H"
              includeMargin
            />
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {qrCode.areaName} ({qrCode.type})
          </p>
        </div>
        
        <div className="flex space-x-2 justify-center">
          <Button 
            variant="outline" 
            onClick={() => onPrint(qrCode)}
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
  );
};

export default QrCodePreviewModal;
