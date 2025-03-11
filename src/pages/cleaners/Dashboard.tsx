
import { useState } from "react";
import { motion } from "framer-motion";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useConfirmation } from "@/hooks/useConfirmation";
import NoShiftView from "@/components/cleaners/dashboard/NoShiftView";
import DashboardTabs from "@/components/cleaners/dashboard/DashboardTabs";
import CleaningSummaryDialog from "@/components/cleaners/CleaningSummaryDialog";
import ConfirmationDialog from "@/components/cleaners/ConfirmationDialog";

const CleanerDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  
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

  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
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

  // Handler functions
  const handleStartShift = () => {
    if (activeShift) return;
    openScanner("startShift");
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift || activeCleaning) return;
    openScanner("endShift");
  };

  const handleEndShiftWithoutScan = () => {
    if (!activeShift || activeCleaning) return;
    showConfirmationDialog(
      "End Shift Without Scan",
      "Are you sure you want to end your shift without scanning? This action cannot be undone.",
      () => endShift(false)
    );
  };

  const handleStartCleaning = () => {
    if (!activeShift || activeCleaning) return;
    openScanner("startCleaning");
  };

  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) return;
    openScanner("endCleaning");
  };

  const handleEndCleaningWithoutScan = () => {
    if (!activeCleaning) return;
    showConfirmationDialog(
      "End Cleaning Without Scan",
      "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
      () => prepareSummary(false)
    );
  };

  // Handle completing a cleaning summary
  const handleCompleteSummary = () => {
    if (completeSummary()) {
      setActiveTab("home");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!activeShift ? (
          <NoShiftView onStartShift={handleStartShift} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Cleaner Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your shifts and cleaning tasks
              </p>
            </div>

            <DashboardTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeShift={activeShift}
              elapsedTime={elapsedTime}
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
            />
          </>
        )}
      </motion.div>

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
    </div>
  );
};

export default CleanerDashboard;
