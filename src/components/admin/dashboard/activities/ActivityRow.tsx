
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Activity, getStatusBadgeClass } from "./types";

interface ActivityRowProps {
  activity: Activity;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ activity }) => {
  return (
    <TableRow key={`${activity.type}-${activity.id}`}>
      <TableCell>{activity.date}</TableCell>
      <TableCell>
        <span className="capitalize">{activity.type}</span>
      </TableCell>
      <TableCell>{activity.userName}</TableCell>
      <TableCell>{activity.location || "Unknown"}</TableCell>
      <TableCell>{activity.startTime}</TableCell>
      <TableCell>{activity.endTime || "In progress"}</TableCell>
      <TableCell>{activity.duration}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(activity.status)}`}>
          {activity.status}
        </span>
      </TableCell>
    </TableRow>
  );
};

export default ActivityRow;
