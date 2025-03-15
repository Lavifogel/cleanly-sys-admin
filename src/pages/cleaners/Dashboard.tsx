
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import DashboardContent from "@/components/cleaners/dashboard/DashboardContent";
import DashboardDialogs from "@/components/cleaners/dashboard/DashboardDialogs";

const CleanerDashboard = () => {
  const navigate = useNavigate();
  
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
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift,
    handleStartCleaning,
    handleEndCleaningWithScan,
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

  // If there's no active shift, redirect to welcome page
  useEffect(() => {
    if (!activeShift) {
      navigate("/cleaners/welcome");
    }
  }, [activeShift, navigate]);

  // If no active shift and this component still renders, show loading
  if (!activeShift) {
    return (
      <div className="container mx-auto p-4 md:p-6 pt-20 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 pt-20">
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
        handleAutoEndShift={handleAutoEndShift}
        handleAutoEndCleaning={handleAutoEndCleaning}
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
        images={images}
      />
    </div>
  );
};

export default CleanerDashboard;
