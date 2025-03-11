
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";

export interface ShiftHistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  cleanings: number;
}

interface ProfileTabProps {
  shiftsHistory: ShiftHistoryItem[];
}

const ProfileTab = ({ shiftsHistory }: ProfileTabProps) => {
  return (
    <div className="space-y-4">
      <ShiftHistoryCard shiftsHistory={shiftsHistory} />
      <ProfileCard />
    </div>
  );
};

export default ProfileTab;
