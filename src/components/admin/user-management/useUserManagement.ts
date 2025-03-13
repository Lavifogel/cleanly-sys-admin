
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
      console.log("Fetching users data...");
      
      // Get all users with the schema
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }
      
      console.log("Users data received:", usersData);
      
      // Process and format the user data
      if (usersData) {
        const formattedUsers: CleanerUser[] = usersData.map(user => {
          return {
            id: user.id,
            phoneNumber: user.phone || '',
            name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
            role: user.role || 'cleaner',
            startDate: user.start_date || '',
            status: (user.active === false) ? "inactive" : "active",
            email: user.email || ''
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
        .from('users')
        .update({ active: newStatus })
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
        .from('users')
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
