
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Lock, Check, X } from "lucide-react";
import { CleanerUser } from "./types";

interface UserTableRowProps {
  user: CleanerUser;
  onEdit: (user: CleanerUser) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (user: CleanerUser) => void;
  onResetPassword: (userId: string) => void;
}

const UserTableRow = ({ 
  user, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword 
}: UserTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.phoneNumber}</TableCell>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.role}</TableCell>
      <TableCell>{user.startDate}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      </TableCell>
      <TableCell>
        {user.password ? (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.password}</span>
        ) : (
          <span className="text-gray-400">No password</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResetPassword(user.id)}
            title="Reset Password"
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
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
            onClick={() => onEdit(user)}
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
            onClick={() => onDelete(user.id)}
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
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
