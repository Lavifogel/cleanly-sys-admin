
import { CleaningHistoryItem } from "@/types/cleaning";
import { ShiftHistoryItem } from "@/hooks/shift/types";
import ProfileCard from "@/components/cleaners/ProfileCard";
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import CleaningHistoryCard from "@/components/cleaners/CleaningHistoryCard";

interface ProfileContentProps {
  shiftsHistory: ShiftHistoryItem[];
  cleaningsHistory: CleaningHistoryItem[];
}

const ProfileContent = ({
  shiftsHistory,
  cleaningsHistory
}: ProfileContentProps) => {
  return (
    <div className="space-y-6">
      <ProfileCard />
      
      <ShiftHistoryCard shifts={shiftsHistory} />
      
      <CleaningHistoryCard 
        cleanings={cleaningsHistory}
        title="All Cleanings" 
        emptyMessage="No cleanings completed yet"
      />
    </div>
  );
};

export default ProfileContent;
