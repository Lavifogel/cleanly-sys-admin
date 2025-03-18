
import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import ActivityTableHeader from "./activities/ActivityTableHeader";
import ActivityRow from "./activities/ActivityRow";
import EmptyState from "./activities/EmptyState";
import LoadingSkeleton from "./activities/LoadingSkeleton";
import useActivities from "./activities/useActivities";

export function ActivitiesTable() {
  const { activities, loading } = useActivities();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Table>
      <ActivityTableHeader />
      <TableBody>
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          activities.map((activity) => (
            <ActivityRow key={`${activity.type}-${activity.id}`} activity={activity} />
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default ActivitiesTable;
