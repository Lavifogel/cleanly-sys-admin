
export interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export interface QRScannerStates {
  isScanning: boolean;
  error: string | null;
  isTakingPicture: boolean;
  cameraActive: boolean;
  simulationActive: boolean;
  simulationProgress: number;
}
