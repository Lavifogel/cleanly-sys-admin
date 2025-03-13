
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const ProfileCard = () => {
  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    startDate: "",
    role: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // In a real app, this would use the current authenticated user's ID
        // For now, we'll just fetch the first cleaner for demonstration
        const { data, error } = await supabase
          .rpc('get_full_user_info')
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const user = data[0];
          setProfile({
            name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
            phoneNumber: user.phone || user.user_name || '',
            startDate: user.start_date ? new Date(user.start_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not set',
            role: user.role || 'Cleaner',
            email: user.email || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{profile.name || 'Loading...'}</CardTitle>
          <CardDescription>{profile.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{profile.phoneNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{profile.startDate}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{profile.role}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
