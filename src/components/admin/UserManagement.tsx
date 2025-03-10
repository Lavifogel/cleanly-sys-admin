
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Lock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([
    { 
      phoneNumber: "+1234567890", 
      name: "Jane Smith", 
      role: "Cleaner", 
      startDate: "2023-01-15", 
      status: "active" 
    },
    { 
      phoneNumber: "+1987654321", 
      name: "John Doe", 
      role: "Cleaner", 
      startDate: "2023-02-20", 
      status: "active" 
    },
    { 
      phoneNumber: "+1555555555", 
      name: "Mark Johnson", 
      role: "Cleaner", 
      startDate: "2023-03-10", 
      status: "inactive" 
    },
  ]);

  const handleAddUser = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in the next update!",
    });
  };

  const handleResetPassword = (phoneNumber: string) => {
    toast({
      title: "Password Reset Link Sent",
      description: `A password reset link has been sent to ${phoneNumber}`,
    });
  };

  const toggleStatus = (phoneNumber: string) => {
    setUsers(
      users.map((user) =>
        user.phoneNumber === phoneNumber
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
    
    toast({
      title: "Status Updated",
      description: "User status has been updated successfully",
    });
  };

  const handleDeleteUser = (phoneNumber: string) => {
    toast({
      title: "Confirmation Required",
      description: "This action cannot be undone. Are you sure?",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input 
            placeholder="Search users..." 
            className="pl-8 w-[250px]"
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
        
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Cleaner
        </Button>
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
        <div className="divide-y">
          {users.map((user) => (
            <div className="grid grid-cols-6 p-4 items-center" key={user.phoneNumber}>
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
                  onClick={() => toggleStatus(user.phoneNumber)}
                  title={user.status === "active" ? "Deactivate" : "Activate"}
                >
                  {user.status === "active" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user.phoneNumber)}
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
      </div>
    </div>
  );
};

export default UserManagement;
