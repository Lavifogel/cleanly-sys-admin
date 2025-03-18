
import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import ActivityTableHeader from "./activities/ActivityTableHeader";
import ActivityRow from "./activities/ActivityRow";
import EmptyState from "./activities/EmptyState";
import LoadingSkeleton from "./activities/LoadingSkeleton";
import useActivities from "./activities/useActivities";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function ActivitiesTable() {
  const { activities, loading, fetchActivities } = useActivities();

  const handleRefresh = () => {
    fetchActivities();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
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
    </div>
  );
}

export default ActivitiesTable;
