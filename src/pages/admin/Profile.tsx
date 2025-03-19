
import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserData } from "@/hooks/useUserData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminProfile = memo(() => {
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
    : "A";

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{userName}</h2>
                <p className="text-muted-foreground capitalize">{userRole}</p>
                <p className="text-sm text-muted-foreground">{user?.phone}</p>
              </div>
            </div>
            
            <div className="pt-2 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/dashboard")}
              >
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate("/admin/users")}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

// Add display name for React DevTools
AdminProfile.displayName = 'AdminProfile';

export default AdminProfile;
