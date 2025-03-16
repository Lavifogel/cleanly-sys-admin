
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";
import { Table, TableBody } from "@/components/ui/table";
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <UserTableHeader />
        <TableBody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center">
                {searchQuery ? "No users match your search" : "No users found. Add your first cleaner!"}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onResetPassword={onResetPassword}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
