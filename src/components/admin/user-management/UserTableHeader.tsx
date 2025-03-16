
import {
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const UserTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Phone Number</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Start Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Password</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;
