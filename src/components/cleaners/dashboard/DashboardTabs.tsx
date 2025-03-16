
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import HomeTab from "@/components/cleaners/dashboard/HomeTab";
import CleaningTab from "@/components/cleaners/dashboard/CleaningTab";
import ProfileTab from "@/components/cleaners/dashboard/ProfileTab";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { Shift } from "@/hooks/useShift";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeShift: Shift;
  elapsedTime: number;
  activeCleaning: Cleaning | null;
  cleaningElapsedTime: number;
  cleaningsHistory: CleaningHistoryItem[];
  shiftsHistory: any[];
  togglePauseCleaning: () => void;
  handleEndShiftWithScan: () => void;
  handleEndShiftWithoutScan: () => void;
  handleStartCleaning: () => void;
  handleEndCleaningWithScan: () => void;
  handleEndCleaningWithoutScan: () => void;
  handleAutoEndCleaning?: () => void;
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
  handleEndCleaningWithoutScan,
  handleAutoEndCleaning
}: DashboardTabsProps) => {
  // Function to switch to the cleaning tab
  const switchToCleaningTab = () => {
    setActiveTab("cleaning");
  };

  // Listen for the custom event to set active tab
  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };

    // Check localStorage for saved tab
    const savedTab = window.localStorage.getItem('dashboard_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear it after use
      window.localStorage.removeItem('dashboard_active_tab');
    }

    // Add event listener
    window.addEventListener('set-active-tab', handleSetActiveTab as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('set-active-tab', handleSetActiveTab as EventListener);
    };
  }, [setActiveTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="mt-6">
        <HomeTab 
          activeShift={activeShift}
          elapsedTime={elapsedTime}
          activeCleaning={activeCleaning}
          cleaningElapsedTime={cleaningElapsedTime}
          cleaningsHistory={cleaningsHistory}
          shiftsHistory={shiftsHistory}
          onEndShiftWithScan={handleEndShiftWithScan}
          onEndShiftWithoutScan={handleEndShiftWithoutScan}
          onStartCleaning={handleStartCleaning}
          onSwitchToCleaningTab={switchToCleaningTab} // Pass the tab switching function
        />
      </TabsContent>

      <TabsContent value="cleaning" className="mt-6">
        <CleaningTab 
          activeCleaning={activeCleaning}
          cleaningElapsedTime={cleaningElapsedTime}
          cleaningsHistory={cleaningsHistory}
          handleStartCleaning={handleStartCleaning}
          handleEndCleaningWithScan={handleEndCleaningWithScan}
          handleEndCleaningWithoutScan={handleEndCleaningWithoutScan}
          togglePauseCleaning={togglePauseCleaning}
          handleAutoEndCleaning={handleAutoEndCleaning || (() => {})}
          activeShiftId={activeShift?.id} // Pass the active shift ID
        />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <ProfileTab 
          shiftsHistory={shiftsHistory}
          cleaningsHistory={cleaningsHistory}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
