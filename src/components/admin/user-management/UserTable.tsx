
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";
import { CleanerUser } from "./types";

interface UserTableProps {
  users: CleanerUser[];
  isLoading: boolean;
  searchQuery: string;
  onEdit: (user: CleanerUser) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (user: CleanerUser) => void;
  onResetPassword: (phoneNumber: string) => void;
}

const UserTable = ({ 
  users, 
  isLoading, 
  searchQuery, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword 
}: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <UserTableHeader />
      {isLoading ? (
        <div className="p-8 text-center">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center">
          {searchQuery ? "No users match your search" : "No users found. Add your first cleaner!"}
        </div>
      ) : (
        <div className="divide-y">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onResetPassword={onResetPassword}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTable;
