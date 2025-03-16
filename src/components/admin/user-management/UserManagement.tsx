
import { useUserManagement } from "./useUserManagement";
import UserSearchBar from "./UserSearchBar";
import UserActionButtons from "./UserActionButtons";
import UserTable from "./UserTable";
import AddEditUserDialog from "../AddEditUserDialog";
import CredentialsDialog from "./CredentialsDialog";

const UserManagement = () => {
  const {
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    currentUser,
    resetCredentials,
    closeCredentialsDialog,
    handleAddUser,
    handleEditUser,
    handleResetPassword,
    toggleStatus,
    handleDeleteUser,
    fetchUsers
  } = useUserManagement();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <UserSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <UserActionButtons 
          onAddUser={handleAddUser} 
          onRefresh={fetchUsers} 
          isLoading={isLoading} 
        />
      </div>
      
      <UserTable 
        users={filteredUsers}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={toggleStatus}
        onResetPassword={handleResetPassword}
      />

      <AddEditUserDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        user={currentUser}
        onSuccess={fetchUsers}
      />

      {resetCredentials && (
        <CredentialsDialog
          open={!!resetCredentials}
          onClose={closeCredentialsDialog}
          password={resetCredentials.password}
          title="Reset Password"
          description="New password has been generated for this user."
        />
      )}
    </div>
  );
};

export default UserManagement;
