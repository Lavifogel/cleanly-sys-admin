
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import DashboardDialogs from "@/components/cleaners/dashboard/DashboardDialogs";
import CleanerNavigation from "@/components/cleaners/navigation/CleanerNavigation";
import { motion } from "framer-motion";
import CleaningTabContent from "@/components/cleaners/dashboard/CleaningTabContent";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CleanersCleaning = () => {
  const {
    activeShift,
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
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

  const navigate = useNavigate();

  // Redirect to dashboard if no active shift
  useEffect(() => {
    if (!activeShift) {
      navigate('/cleaners/dashboard');
    }
  }, [activeShift, navigate]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CleanerNavigation active="cleaning" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <CleaningTabContent 
          activeCleaning={activeCleaning}
          cleaningElapsedTime={cleaningElapsedTime}
          cleaningsHistory={cleaningsHistory}
          handleStartCleaning={handleStartCleaning}
          handleEndCleaningWithScan={handleEndCleaningWithScan}
          handleEndCleaningWithoutScan={handleEndCleaningWithoutScan}
          togglePauseCleaning={togglePauseCleaning}
          handleAutoEndCleaning={handleAutoEndCleaning}
          activeShiftId={activeShift?.id}
        />
      </motion.div>

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

export default CleanersCleaning;
