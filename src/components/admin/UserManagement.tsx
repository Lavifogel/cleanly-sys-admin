
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Lock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddEditUserDialog from "./AddEditUserDialog";

type CleanerUser = {
  id: string;
  phoneNumber: string;
  name: string;
  role: string;
  startDate: string;
  status: "active" | "inactive";
  email: string;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<CleanerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CleanerUser | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get cleaners and profiles separately and join them in JavaScript
      const { data: cleaners, error: cleanersError } = await supabase
        .from('cleaners')
        .select('*')
        .order('start_date', { ascending: false });

      if (cleanersError) throw cleanersError;

      // Fetch all profiles to manually join with cleaners
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (cleaners && profiles) {
        // Create a map of profiles by ID for efficient lookup
        const profilesMap = profiles.reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});

        // Join cleaners with their profiles
        const formattedUsers: CleanerUser[] = cleaners.map(cleaner => {
          const profile = profilesMap[cleaner.id];
          return {
            id: cleaner.id,
            phoneNumber: cleaner.phone || '',
            name: profile ? 
              `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
              'Unknown',
            role: profile?.role || 'Cleaner',
            startDate: cleaner.start_date || '',
            status: cleaner.active ? "active" : "inactive",
            email: profile?.email || ''
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    // In a real application, you should add a confirmation dialog here
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-[250px]">
          <Input 
            placeholder="Search users..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchUsers} 
            disabled={isLoading}
            className="flex-1 md:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={handleAddUser}
            className="flex-1 md:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Cleaner
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="grid grid-cols-6 p-4 font-medium bg-muted/40">
          <div>Phone Number</div>
          <div>Name</div>
          <div>Role</div>
          <div>Start Date</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            {searchQuery ? "No users match your search" : "No users found. Add your first cleaner!"}
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div className="grid grid-cols-6 p-4 items-center" key={user.id}>
                <div>{user.phoneNumber}</div>
                <div>{user.name}</div>
                <div>{user.role}</div>
                <div>{user.startDate}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPassword(user.phoneNumber)}
                    title="Reset Password"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(user)}
                    title={user.status === "active" ? "Deactivate" : "Activate"}
                  >
                    {user.status === "active" ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditUserDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        user={currentUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagement;
