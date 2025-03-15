
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import QRScannerHandler from "@/components/cleaners/dashboard/QRScannerHandler";
import DashboardDialogs from "@/components/cleaners/dashboard/DashboardDialogs";
import NoShiftView from "@/components/cleaners/dashboard/NoShiftView";
import HomeContent from "@/components/cleaners/dashboard/HomeContent";
import CleanerNavigation from "@/components/cleaners/navigation/CleanerNavigation";
import { motion } from "framer-motion";

const CleanersHome = () => {
  const {
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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <CleanerNavigation active="home" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        {!activeShift ? (
          <NoShiftView onStartShift={handleStartShift} />
        ) : (
          <HomeContent 
            activeShift={activeShift}
            elapsedTime={elapsedTime}
            activeCleaning={activeCleaning}
            cleaningElapsedTime={cleaningElapsedTime}
            cleaningsHistory={cleaningsHistory}
            shiftsHistory={shiftsHistory}
            handleEndShiftWithScan={handleEndShiftWithScan}
            handleEndShiftWithoutScan={handleEndShiftWithoutScan}
            handleStartCleaning={handleStartCleaning}
            handleAutoEndShift={handleAutoEndShift}
          />
        )}
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

export default CleanersHome;
