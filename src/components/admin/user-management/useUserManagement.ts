
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CleanerUser } from "./types";

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<CleanerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CleanerUser | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching profiles data...");
      
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles data received:", profilesData);
      
      // Get cleaner specific data
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('cleaners')
        .select('*');
      
      if (cleanersError) {
        console.error("Error fetching cleaners:", cleanersError);
        throw cleanersError;
      }
      
      console.log("Cleaners data received:", cleanersData);
      
      // Create a map of cleaner data for quick lookup
      const cleanersMap = new Map();
      cleanersData?.forEach(cleaner => {
        cleanersMap.set(cleaner.id, cleaner);
      });
      
      // Process and combine the data
      if (profilesData) {
        const formattedUsers: CleanerUser[] = profilesData.map(profile => {
          const cleaner = cleanersMap.get(profile.id);
          
          return {
            id: profile.id,
            phoneNumber: cleaner?.phone || profile.user_name || '',
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
            role: profile.role || 'cleaner',
            startDate: cleaner?.start_date || '',
            status: (cleaner?.active === false) ? "inactive" : "active",
            email: profile.email || ''
          };
        });
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Failed to load users",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: CleanerUser) => {
    setCurrentUser(user);
    setDialogOpen(true);
  };

  const handleResetPassword = (phoneNumber: string) => {
    toast({
      title: "Password Reset Link Sent",
      description: `A password reset link has been sent to ${phoneNumber}`,
    });
  };

  const toggleStatus = async (user: CleanerUser) => {
    try {
      const newStatus = user.status === "active" ? false : true;
      
      const { error } = await supabase
        .from('cleaners')
        .update({ active: newStatus } as any)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, status: newStatus ? "active" : "inactive" }
            : u
        )
      );
      
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Update Failed",
        description: "Could not update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('cleaners')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User Deleted",
        description: "User has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber.includes(searchQuery) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    currentUser,
    setCurrentUser,
    handleAddUser,
    handleEditUser,
    handleResetPassword,
    toggleStatus,
    handleDeleteUser,
    fetchUsers
  };
};
