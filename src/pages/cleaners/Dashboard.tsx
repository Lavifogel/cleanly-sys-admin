
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import { useShiftActions } from "@/hooks/useShiftActions";
import { useCleaningActions } from "@/hooks/useCleaningActions";

// Import components
import DashboardLayout from "@/components/cleaners/DashboardLayout";
import StartShiftCard from "@/components/cleaners/StartShiftCard";
import ActiveShiftCard from "@/components/cleaners/ActiveShiftCard";
import ActiveCleaningCard from "@/components/cleaners/ActiveCleaningCard";
import RecentCleaningsCard from "@/components/cleaners/RecentCleaningsCard";
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";
import CleaningSummaryDialog from "@/components/cleaners/CleaningSummaryDialog";
import ConfirmationDialog from "@/components/cleaners/ConfirmationDialog";
import QRCodeScanner from "@/components/QRCodeScanner";
import { TabsContent } from "@/components/ui/tabs";

const CleanerDashboard = () => {
  // Use our custom hooks
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift
  } = useShift();
  
  const {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary
  } = useCleaning(activeShift?.id);
  
  const {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  } = useQRScanner();
  
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    showConfirmationDialog
  } = useConfirmation();

  const { activeTab, setActiveTab, handleStartCleaning } = useDashboardTabs(activeCleaning);
  const { handleStartShift, handleEndShift } = useShiftActions();
  const { handleEndCleaning } = useCleaningActions();
  
  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    closeScanner();
    switch (scannerPurpose) {
      case "startShift":
        startShift(decodedText);
        break;
      case "endShift":
        endShift(true, decodedText);
        break;
      case "startCleaning":
        startCleaning(decodedText);
        setActiveTab("cleaning");
        break;
      case "endCleaning":
        prepareSummary(true, decodedText);
        break;
      default:
        break;
    }
  };

  // Handle completing a cleaning summary
  const handleCompleteSummary = () => {
    if (completeSummary()) {
      setActiveTab("home");
    }
  };

  if (!activeShift) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <StartShiftCard onStartShift={() => handleStartShift(!!activeShift, openScanner)} />
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveCleaning={!!activeCleaning}
      >
        <TabsContent value="home" className="space-y-4">
          <ActiveShiftCard 
            startTime={activeShift.startTime}
            elapsedTime={elapsedTime}
            onEndShiftWithScan={() => handleEndShift(
              !!activeShift,
              !!activeCleaning,
              true,
              openScanner,
              showConfirmationDialog,
              endShift
            )}
            onEndShiftWithoutScan={() => handleEndShift(
              !!activeShift,
              !!activeCleaning,
              false,
              openScanner,
              showConfirmationDialog,
              endShift
            )}
            onStartCleaning={() => handleStartCleaning(!!activeShift, !!activeCleaning, openScanner)}
          />
          <RecentCleaningsCard 
            cleaningsHistory={cleaningsHistory} 
            currentShiftId={activeShift.id}
          />
        </TabsContent>

        <TabsContent value="cleaning" className="space-y-4">
          {activeCleaning && (
            <ActiveCleaningCard 
              location={activeCleaning.location}
              startTime={activeCleaning.startTime}
              cleaningElapsedTime={cleaningElapsedTime}
              isPaused={activeCleaning.paused}
              onPauseCleaning={togglePauseCleaning}
              onEndCleaningWithScan={() => handleEndCleaning(
                activeCleaning,
                true,
                openScanner,
                showConfirmationDialog,
                prepareSummary
              )}
              onEndCleaningWithoutScan={() => handleEndCleaning(
                activeCleaning,
                false,
                openScanner,
                showConfirmationDialog,
                prepareSummary
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <ShiftHistoryCard shiftsHistory={shiftsHistory} />
          <ProfileCard />
        </TabsContent>
      </DashboardLayout>

      {showQRScanner && (
        <QRCodeScanner 
          onScanSuccess={handleQRScan}
          onClose={closeScanner}
        />
      )}

      <CleaningSummaryDialog 
        open={showSummary}
        onOpenChange={setShowSummary}
        cleaningSummary={cleaningSummary}
        summaryNotes={summaryNotes}
        onSummaryNotesChange={setSummaryNotes}
        onAddImage={addImage}
        onRemoveImage={removeImage}
        onCompleteSummary={handleCompleteSummary}
      />

      <ConfirmationDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        onConfirm={() => confirmAction?.action && confirmAction.action()}
      />
    </>
  );
};

export default CleanerDashboard;
