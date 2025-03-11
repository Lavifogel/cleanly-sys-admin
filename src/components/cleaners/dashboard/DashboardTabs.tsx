
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ClipboardCheck } from "lucide-react";
import HomeTab from "./HomeTab";
import CleaningTab from "./CleaningTab";
import { CleaningHistoryItem } from "@/types/cleaning";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeShift: {
    id: string;
    startTime: Date;
  };
  elapsedTime: number;
  activeCleaning: {
    location: string;
    startTime: Date;
    paused: boolean;
  } | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  shiftsHistory: any[];
  togglePauseCleaning: () => void;
  handleEndShiftWithScan: () => void;
  handleEndShiftWithoutScan: () => void;
  handleStartCleaning: () => void;
  handleEndCleaningWithScan: () => void;
  handleEndCleaningWithoutScan: () => void;
}

const DashboardTabs = ({
  activeTab,
  setActiveTab,
  activeShift,
  elapsedTime,
  activeCleaning,
  cleaningElapsedTime,
  cleaningsHistory,
  shiftsHistory,
  togglePauseCleaning,
  handleEndShiftWithScan,
  handleEndShiftWithoutScan,
  handleStartCleaning,
  handleEndCleaningWithScan,
  handleEndCleaningWithoutScan
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="home">
          <Clock className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Shift</span>
        </TabsTrigger>
        <TabsTrigger value="cleaning" disabled={!activeCleaning}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Cleaning</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <HomeTab 
          activeShift={activeShift}
          elapsedTime={elapsedTime}
          activeCleaning={activeCleaning}
          cleaningElapsedTime={cleaningElapsedTime}
          cleaningsHistory={cleaningsHistory}
          onEndShiftWithScan={handleEndShiftWithScan}
          onEndShiftWithoutScan={handleEndShiftWithoutScan}
          onStartCleaning={handleStartCleaning}
        />
      </TabsContent>

      <TabsContent value="cleaning">
        <CleaningTab 
          activeCleaning={activeCleaning}
          cleaningElapsedTime={cleaningElapsedTime}
          onPauseCleaning={togglePauseCleaning}
          onEndCleaningWithScan={handleEndCleaningWithScan}
          onEndCleaningWithoutScan={handleEndCleaningWithoutScan}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
