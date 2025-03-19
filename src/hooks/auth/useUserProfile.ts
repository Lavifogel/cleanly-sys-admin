
import { User } from "@/types/user";

export function useUserProfile(user: User | null) {
  const userRole = user?.role || 'cleaner';
  const userName = user?.fullName || 'User';

  return {
    userRole,
    userName
  };
}
