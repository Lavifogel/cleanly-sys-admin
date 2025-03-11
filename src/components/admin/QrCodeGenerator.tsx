
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import QrCodeForm from "./qr-code/QrCodeForm";
import QrCodeList from "./qr-code/QrCodeList";
import QrCodePreviewModal from "./qr-code/QrCodePreviewModal";
import { 
  fetchQrCodes, 
  generateAreaId, 
  generateQrCodeDataUrl, 
  saveQrCode 
} from "./qr-code/qrCodeUtils";

interface QrCode {
  id: string;
  areaName: string;
  type: string;
  areaId: string;
  qrCodeImageUrl?: string;
}

const QrCodeGenerator = () => {
  const { toast } = useToast();
  const [generatedQrCodes, setGeneratedQrCodes] = useState<QrCode[]>([]);
  const [showQrCode, setShowQrCode] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<QrCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQrCodes();
  }, []);

  const loadQrCodes = async () => {
    try {
      const codes = await fetchQrCodes();
      setGeneratedQrCodes(codes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast({
        title: "Error",
        description: "Failed to load QR codes",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQR = async (areaName: string, qrType: string) => {
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
      const areaId = await generateAreaId(areaName);
      
      const qrData = {
        areaId,
        areaName,
        type: qrType
      };
      
      const qrCodeImageUrl = await generateQrCodeDataUrl(qrData);
      
      const newQrCode = await saveQrCode({
        areaName,
        type: qrType,
        areaId,
        qrCodeImageUrl
      });

      setGeneratedQrCodes([newQrCode, ...generatedQrCodes]);
      setCurrentQrCode(newQrCode);
      setShowQrCode(true);

      toast({
        title: "QR Code Generated",
        description: `QR code for ${areaName} has been created successfully`,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: `Failed to generate QR code: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowQR = (qrCode: QrCode) => {
    setCurrentQrCode(qrCode);
    setShowQrCode(true);
  };

  const handlePrintQR = (qrCode: QrCode) => {
    setCurrentQrCode(qrCode);
    
    setTimeout(() => {
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
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${qrCode.areaName}</h2>
                <p>Type: ${qrCode.type}</p>
                ${qrCode.qrCodeImageUrl 
                  ? `<img src="${qrCode.qrCodeImageUrl}" alt="QR Code" />`
                  : '<!-- QR Code will be generated on print -->'
                }
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }, 200);

    toast({
      title: "Printing QR Code",
      description: "The QR code is being sent to the printer",
    });
  };

  return (
    <div className="space-y-6">
      <QrCodeForm 
        onGenerateQR={handleGenerateQR}
        isLoading={isLoading}
      />

      {showQrCode && currentQrCode && (
        <QrCodePreviewModal 
          qrCode={currentQrCode}
          onClose={() => {
            setShowQrCode(false);
            setCurrentQrCode(null);
          }}
          onPrint={handlePrintQR}
        />
      )}

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium">Generated QR Codes</h3>
        <QrCodeList 
          qrCodes={generatedQrCodes}
          onShowQR={handleShowQR}
          onPrintQR={handlePrintQR}
        />
      </div>
    </div>
  );
};

export default QrCodeGenerator;
