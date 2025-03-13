
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ClipboardCheck, User } from "lucide-react";
import HomeTab from "./HomeTab";
import CleaningTab from "./CleaningTab";
import ProfileTab from "./ProfileTab";
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
  // Listen for profile tab event from Navbar
  useEffect(() => {
    const handleSetProfileTab = () => {
      setActiveTab("profile");
    };
    
    window.addEventListener("set-profile-tab", handleSetProfileTab);
    
    return () => {
      window.removeEventListener("set-profile-tab", handleSetProfileTab);
    };
  }, [setActiveTab]);

  return (
    <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">
          <Clock className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Shift</span>
        </TabsTrigger>
        <TabsTrigger value="cleaning" disabled={!activeCleaning}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Cleaning</span>
        </TabsTrigger>
        <TabsTrigger value="profile">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Profile</span>
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

      <TabsContent value="profile">
        <ProfileTab 
          shiftsHistory={shiftsHistory} 
          cleaningsHistory={cleaningsHistory}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
