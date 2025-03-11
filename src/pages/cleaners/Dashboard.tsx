
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import DashboardContent from "@/components/cleaners/dashboard/DashboardContent";
import DashboardDialogs from "@/components/cleaners/dashboard/DashboardDialogs";

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
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
    handleCompleteSummary,
    togglePauseCleaning,
    setSummaryNotes,
    setShowSummary,
    closeScanner,
    setShowConfirmDialog,
    addImage,
    removeImage
  } = useDashboardHandlers();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <DashboardContent 
        activeShift={activeShift}
        elapsedTime={elapsedTime}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCleaning={activeCleaning}
        cleaningElapsedTime={cleaningElapsedTime}
        cleaningsHistory={cleaningsHistory}
        shiftsHistory={shiftsHistory}
        togglePauseCleaning={togglePauseCleaning}
        handleEndShiftWithScan={handleEndShiftWithScan}
        handleEndShiftWithoutScan={handleEndShiftWithoutScan}
        handleStartCleaning={handleStartCleaning}
        handleEndCleaningWithScan={handleEndCleaningWithScan}
        handleEndCleaningWithoutScan={handleEndCleaningWithoutScan}
        handleStartShift={handleStartShift}
      />

      <QRScannerHandler 
        showQRScanner={showQRScanner}
        scannerPurpose={scannerPurpose}
        closeScanner={closeScanner}
        onQRScan={handleQRScan}
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
      />
    </div>
  );
};

export default CleanerDashboard;
