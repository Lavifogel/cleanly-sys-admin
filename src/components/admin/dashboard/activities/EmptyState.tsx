
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

export const EmptyState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
        No activities found
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
