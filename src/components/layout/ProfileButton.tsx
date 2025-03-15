
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileButtonProps {
  onClick?: () => void;
  'aria-label'?: string;
}

const ProfileButton = ({ 
  onClick = () => {}, 
  'aria-label': ariaLabel = 'Profile' 
}: ProfileButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:flex"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <UserRound className="h-5 w-5" />
    </Button>
  );
};

export default ProfileButton;
