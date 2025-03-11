
import StartShiftCard from "@/components/cleaners/StartShiftCard";

interface NoShiftViewProps {
  onStartShift: () => void;
}

const NoShiftView = ({ onStartShift }: NoShiftViewProps) => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <StartShiftCard onStartShift={onStartShift} />
      </div>
    </div>
  );
};

export default NoShiftView;
