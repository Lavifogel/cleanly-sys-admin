
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";

interface ProfileTabProps {
  shiftsHistory: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    status: string;
    cleanings: number;
  }[];
}

const ProfileTab = ({ shiftsHistory }: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <ShiftHistoryCard shiftsHistory={shiftsHistory} />
    </div>
  );
};

export default ProfileTab;
