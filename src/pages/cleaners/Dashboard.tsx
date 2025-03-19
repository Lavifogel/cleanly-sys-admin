
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import DashboardContent from "@/components/cleaners/dashboard/DashboardContent";
import DashboardDialogs from "@/components/cleaners/dashboard/DashboardDialogs";
import { useEffect } from "react";

const CleanerDashboard = () => {
  const {
    activeTab,
    setActiveTab,
    activeShift,
    elapsedTime,
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    shiftsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    showQRScanner,
    scannerPurpose,
    showConfirmDialog,
    confirmAction,
    isUploading,
    images,
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift,
    handleStartCleaning,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary,
    togglePauseCleaning,
    setSummaryNotes,
    setShowSummary,
    closeScanner,
    setShowConfirmDialog,
    addImage,
    removeImage
  } = useDashboardHandlers();

  // Ensure the home tab is selected on initial render
  useEffect(() => {
    if (!activeTab || activeTab === "") {
      console.log("Setting default tab to home in CleanerDashboard");
      setActiveTab("home");
    }
  }, [activeTab, setActiveTab]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardContent 
        activeShift={activeShift}
        elapsedTime={elapsedTime}
        activeTab={activeTab || "home"}
        setActiveTab={setActiveTab}
        activeCleaning={activeCleaning}
        cleaningElapsedTime={cleaningElapsedTime}
        cleaningsHistory={cleaningsHistory}
        shiftsHistory={shiftsHistory}
        togglePauseCleaning={togglePauseCleaning}
        handleEndShiftWithScan={handleEndShiftWithScan}
        handleEndShiftWithoutScan={handleEndShiftWithoutScan}
        handleStartCleaning={handleStartCleaning}
        handleEndCleaningWithoutScan={handleEndCleaningWithoutScan}
        handleStartShift={handleStartShift}
        handleAutoEndShift={handleAutoEndShift}
        handleAutoEndCleaning={handleAutoEndCleaning}
      />

      <QRScannerHandler 
        showQRScanner={showQRScanner}
        scannerPurpose={scannerPurpose}
        closeScanner={closeScanner}
        onQRScan={handleQRScan}
        activeShift={!!activeShift}
      />

      <DashboardDialogs 
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        cleaningSummary={cleaningSummary}
        summaryNotes={summaryNotes}
        setSummaryNotes={setSummaryNotes}
        addImage={addImage}
        removeImage={removeImage}
        handleCompleteSummary={handleCompleteSummary}
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        confirmAction={confirmAction}
        isUploading={isUploading}
        images={images}
      />
    </div>
  );
};

export default CleanerDashboard;
