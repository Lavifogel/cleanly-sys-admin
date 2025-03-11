
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface UserActionButtonsProps {
  onAddUser: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const UserActionButtons = ({ onAddUser, onRefresh, isLoading }: UserActionButtonsProps) => {
  return (
    <div className="flex gap-2 w-full md:w-auto">
      <Button 
        variant="outline" 
        onClick={onRefresh} 
        disabled={isLoading}
        className="flex-1 md:flex-none"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <Button 
        onClick={onAddUser}
        className="flex-1 md:flex-none"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Cleaner
      </Button>
    </div>
  );
};

export default UserActionButtons;
