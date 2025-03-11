
import { useRef } from "react";

export function useFileUpload(onFileSelected: (file: File) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    onFileSelected(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    triggerFileSelect,
    handleFileSelect
  };
}
