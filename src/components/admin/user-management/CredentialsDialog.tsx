
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  password: string;
  title: string;
  description: string;
  activationCode?: string; // Optional
}

const CredentialsDialog = ({
  open,
  onClose,
  password,
  title,
  description,
  activationCode
}: CredentialsDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to clipboard`,
    });
    
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {activationCode && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Activation Code</div>
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-md flex-1 font-mono">
                  {activationCode}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleCopy(activationCode, "Activation code")}
                  className={copied === "Activation code" ? "bg-green-50 text-green-700" : ""}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Password</div>
            <div className="flex items-center gap-2">
              <div className="bg-muted p-2 rounded-md flex-1 font-mono">
                {password}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleCopy(password, "Password")}
                className={copied === "Password" ? "bg-green-50 text-green-700" : ""}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => {
              let fullText = `Password: ${password}`;
              if (activationCode) {
                fullText = `Activation Code: ${activationCode}\n${fullText}`;
              }
              handleCopy(fullText, "All credentials");
            }}
            className={copied === "All credentials" ? "bg-green-600" : ""}
          >
            Copy All
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialsDialog;
