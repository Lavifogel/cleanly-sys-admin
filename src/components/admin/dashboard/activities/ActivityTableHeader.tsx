
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ActivityTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Cleaner</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Start Time</TableHead>
        <TableHead>End Time</TableHead>
        <TableHead>Duration</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ActivityTableHeader;
