
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/useUserData";

interface ProfileButtonProps {
  onClick?: () => void;
}

const ProfileButton = ({ onClick }: ProfileButtonProps) => {
  const { userName } = useUserData();
  
  // Get initials from name
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
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
  );
};

export default ProfileButton;
