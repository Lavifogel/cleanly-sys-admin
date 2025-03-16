
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/useUserData";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileButtonProps {
  onClick?: () => void;
}

const ProfileButton = ({ onClick }: ProfileButtonProps) => {
  const { userName, isAuthenticated, logout } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get initials from name
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleProfileClick = () => {
    if (onClick) {
      onClick();
    } else if (isAuthenticated) {
      // Navigate to cleaners dashboard with profile tab selected
      navigate("/cleaners/dashboard");
      
      // Trigger profile tab selection after navigation
      setTimeout(() => {
        const event = new CustomEvent('set-active-tab', { detail: 'profile' });
        window.dispatchEvent(event);
      }, 100);
    } else {
      navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={handleProfileClick}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      {isAuthenticated && (
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default ProfileButton;
