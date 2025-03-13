
/**
 * Types related to QR code generation and management
 */

/**
 * Represents a QR code entity stored in the database
 */
export interface QrCode {
  id: string;
  areaName: string;
  type: string;
  areaId: string;
  qrCodeImageUrl?: string;
  createdAt?: string;
}

/**
 * Data structure for QR code content
 */
export interface QrCodeData {
  areaId: string;
  areaName: string;
  type: string;
}

/**
 * Parameters for saving a QR code to the database
 */
export interface SaveQrCodeParams {
  areaName: string;
  type: string;
  areaId: string;
  qrCodeImageUrl: string;
}

/**
 * Props for the QrCodeForm component
 */
export interface QrCodeFormProps {
  onGenerateQR: (areaName: string, qrType: string) => void;
  isLoading: boolean;
}

/**
 * Props for the QrCodeList component
 */
export interface QrCodeListProps {
  qrCodes: QrCode[];
  onShowQR: (qrCode: QrCode) => void;
  onPrintQR: (qrCode: QrCode) => void;
}

/**
 * Props for the QrCodePreviewModal component
 */
export interface QrCodePreviewModalProps {
  qrCode: QrCode;
  onClose: () => void;
  onPrint: (qrCode: QrCode) => void;
}

/**
 * Valid QR code types
 */
export type QrCodeType = "Shift" | "Cleaning";

/**
 * Represents an area entity
 */
export interface Area {
  id: string;
  areaId: string;
  name: string;
  description?: string;
  floor?: string;
  building?: string;
  createdAt: string;
  updatedAt: string;
}
