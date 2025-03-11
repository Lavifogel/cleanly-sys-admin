
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Camera, ClipboardCheck, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useConfirmation } from "@/hooks/useConfirmation";

// Import components
import StartShiftCard from "@/components/cleaners/StartShiftCard";
import ActiveShiftCard from "@/components/cleaners/ActiveShiftCard";
import ActiveCleaningCard from "@/components/cleaners/ActiveCleaningCard";
import RecentCleaningsCard from "@/components/cleaners/RecentCleaningsCard";
import ShiftHistoryCard from "@/components/cleaners/ShiftHistoryCard";
import ProfileCard from "@/components/cleaners/ProfileCard";
import CleaningSummaryDialog from "@/components/cleaners/CleaningSummaryDialog";
import ConfirmationDialog from "@/components/cleaners/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

const CleanerDashboard = () => {
  const { toast } = useToast();
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

  // Handle starting a shift
  const handleStartShift = () => {
    if (activeShift) {
      toast({
        title: "Shift Already Active",
        description: "You already have an active shift.",
        variant: "destructive",
      });
      return;
    }
    
    openScanner("startShift");
  };

  // Handle ending a shift
  const handleEndShift = (withScan = true) => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You don't have an active shift to end.",
        variant: "destructive",
      });
      return;
    }

    if (activeCleaning) {
      toast({
        title: "Active Cleaning Detected",
        description: "Please finish your current cleaning before ending your shift.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Shift Without Scan",
        "Are you sure you want to end your shift without scanning? This action cannot be undone.",
        () => endShift(withScan)
      );
    } else {
      openScanner("endShift");
    }
  };

  // Handle starting a cleaning
  const handleStartCleaning = () => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You need to start a shift before you can begin cleaning.",
        variant: "destructive",
      });
      return;
    }

    if (activeCleaning) {
      toast({
        title: "Cleaning Already Active",
        description: "You already have an active cleaning. Please finish it first.",
        variant: "destructive",
      });
      return;
    }

    openScanner("startCleaning");
  };

  // Handle ending a cleaning
  const handleEndCleaning = (withScan = true) => {
    if (!activeCleaning) {
      toast({
        title: "No Active Cleaning",
        description: "You don't have an active cleaning to end.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Cleaning Without Scan",
        "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
        () => prepareSummary(withScan)
      );
    } else {
      openScanner("endCleaning");
    }
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
          <div className="min-h-[80vh] flex flex-col justify-center items-center">
            <div className="w-full max-w-md">
              <StartShiftCard onStartShift={handleStartShift} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Cleaner Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your shifts and cleaning tasks
                </p>
              </div>
            </div>

            <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="home">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Home</span>
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

              <TabsContent value="home" className="space-y-4">
                <ActiveShiftCard 
                  startTime={activeShift.startTime}
                  elapsedTime={elapsedTime}
                  onEndShiftWithScan={() => handleEndShift(true)}
                  onEndShiftWithoutScan={() => handleEndShift(false)}
                  onStartCleaning={handleStartCleaning}
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
                    onEndCleaningWithScan={() => handleEndCleaning(true)}
                    onEndCleaningWithoutScan={() => handleEndCleaning(false)}
                  />
                )}
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <ShiftHistoryCard shiftsHistory={shiftsHistory} />
                <ProfileCard />
              </TabsContent>
            </Tabs>
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
