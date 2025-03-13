
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import CleaningHistoryCard from "@/components/cleaners/CleaningHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";
import { CleaningHistoryItem } from "@/types/cleaning";

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
  cleaningsHistory?: CleaningHistoryItem[];
}

const ProfileTab = ({ shiftsHistory, cleaningsHistory = [] }: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      <ShiftHistoryCard shiftsHistory={shiftsHistory} />
      <CleaningHistoryCard cleaningsHistory={cleaningsHistory} />
      <ProfileCard />
    </div>
  );
};

export default ProfileTab;
