
import { memo } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/hooks/useUserData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProfileCard from "@/components/cleaners/ProfileCard";

const CleanerProfile = memo(() => {
  const { user, userRole, userName } = useUserData();
  const navigate = useNavigate();

  // Get initials from name
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "C";

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Cleaner Profile</h1>
        
        <ProfileCard />
        
        <div className="mt-6">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => navigate("/cleaners/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
});

// Add display name for React DevTools
CleanerProfile.displayName = 'CleanerProfile';

export default CleanerProfile;
