
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

interface ProfileButtonProps {
  onClick?: () => void;
}

const ProfileButton = ({ onClick }: ProfileButtonProps) => {
  const { userName, isAuthenticated, logout } = useUserData();
  const navigate = useNavigate();
  
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
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={onClick}
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
