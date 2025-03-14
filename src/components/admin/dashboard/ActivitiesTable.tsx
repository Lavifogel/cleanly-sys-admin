
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatTime } from "@/utils/timeUtils";

type ActivityType = "shift" | "cleaning";

interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  userName: string;
  location: string | null;
  startTime: string;
  endTime: string | null;
  duration: string;
  status: string;
}

export function ActivitiesTable() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch shifts with user information
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select(`
          id,
          start_time,
          end_time,
          status,
          users (
            id,
            first_name,
            last_name,
            full_name
          ),
          qr_codes (
            area_name
          )
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (shiftsError) throw shiftsError;

      // Fetch cleanings with shift and user information
      const { data: cleaningsData, error: cleaningsError } = await supabase
        .from('cleanings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          qr_codes (
            area_name
          ),
          shifts (
            users (
              id,
              first_name,
              last_name,
              full_name
            )
          )
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (cleaningsError) throw cleaningsError;

      // Process shifts data
      const shiftActivities: Activity[] = (shiftsData || []).map(shift => {
        const userName = shift.users?.full_name || 
                        (shift.users?.first_name && shift.users?.last_name 
                          ? `${shift.users.first_name} ${shift.users.last_name}` 
                          : "Unknown User");
        
        const startTime = shift.start_time ? new Date(shift.start_time) : new Date();
        const endTime = shift.end_time ? new Date(shift.end_time) : null;
        
        const duration = endTime 
          ? formatDuration(startTime, endTime) 
          : "In progress";

        return {
          id: shift.id,
          type: "shift",
          date: format(startTime, "MMM dd, yyyy"),
          userName,
          location: shift.qr_codes?.area_name || null,
          startTime: format(startTime, "HH:mm"),
          endTime: endTime ? format(endTime, "HH:mm") : null,
          duration,
          status: shift.status
        };
      });

      // Process cleanings data
      const cleaningActivities: Activity[] = (cleaningsData || []).map(cleaning => {
        const userName = cleaning.shifts?.users?.full_name || 
                        (cleaning.shifts?.users?.first_name && cleaning.shifts?.users?.last_name 
                          ? `${cleaning.shifts.users.first_name} ${cleaning.shifts.users.last_name}` 
                          : "Unknown User");
        
        const startTime = cleaning.start_time ? new Date(cleaning.start_time) : new Date();
        const endTime = cleaning.end_time ? new Date(cleaning.end_time) : null;
        
        const duration = endTime 
          ? formatDuration(startTime, endTime) 
          : "In progress";

        return {
          id: cleaning.id,
          type: "cleaning",
          date: format(startTime, "MMM dd, yyyy"),
          userName,
          location: cleaning.qr_codes?.area_name || extractLocationFromNotes(cleaning.notes),
          startTime: format(startTime, "HH:mm"),
          endTime: endTime ? format(endTime, "HH:mm") : null,
          duration,
          status: cleaning.status
        };
      });

      // Combine and sort activities by date and start time
      const allActivities = [...shiftActivities, ...cleaningActivities].sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Then sort by start time (newest first)
        return b.startTime.localeCompare(a.startTime);
      });

      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime: Date, endTime: Date): string => {
    const diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const extractLocationFromNotes = (notes: string | null): string | null => {
    if (!notes) return null;
    
    // Try to extract location from notes that follow pattern "Location: X"
    const locationMatch = notes.match(/Location:\s*([^,\n]+)/i);
    return locationMatch ? locationMatch[1].trim() : null;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-blue-100 text-blue-800";
      case 'finished with scan':
      case 'finished':
        return "bg-green-100 text-green-800";
      case 'finished without scan':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
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
      <TableBody>
        {activities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
              No activities found
            </TableCell>
          </TableRow>
        ) : (
          activities.map((activity) => (
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
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default ActivitiesTable;
