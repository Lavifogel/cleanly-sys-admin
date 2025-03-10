
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraAccessProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isTakingPicture: boolean;
  disabled?: boolean;
}

const CameraAccess = ({ onFileSelect, isTakingPicture, disabled }: CameraAccessProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTakePicture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        onClick={handleTakePicture} 
        className="flex items-center gap-2"
        disabled={disabled || isTakingPicture}
      >
        <Camera className="h-5 w-5" />
        {isTakingPicture ? "Processing..." : "Take Picture"}
      </Button>
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={onFileSelect}
        className="hidden"
      />
    </>
  );
};

export default CameraAccess;
