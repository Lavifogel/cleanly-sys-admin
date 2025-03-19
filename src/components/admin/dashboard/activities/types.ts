
export type ActivityStatus = 
  | "active" 
  | "completed" 
  | "paused" 
  | "cancelled" 
  | "finished" 
  | "finished automatically"
  | "finished with scan"
  | "finished without scan"
  | string;

export type ActivityType = "shift" | "cleaning";

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  userName: string;
  location: string | null;
  startTime: string;
  endTime: string | null;
  duration: string;
  status: ActivityStatus;
}

// Utility functions
export const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return "bg-blue-100 text-blue-800";
    case 'finished with scan':
    case 'finished':
      return "bg-green-100 text-green-800";
    case 'finished without scan':
      return "bg-yellow-100 text-yellow-800";
    case 'finished automatically':
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatDuration = (startTime: Date, endTime: Date): string => {
  const diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

export const extractLocationFromNotes = (notes: string | null): string | null => {
  if (!notes) return null;
  
  // Try to extract location from notes that follow pattern "Location: X"
  const locationMatch = notes.match(/Location:\s*([^,\n]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
};
