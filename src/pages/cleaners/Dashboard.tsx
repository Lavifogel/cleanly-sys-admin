import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Camera, ClipboardCheck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeScanner from "@/components/QRCodeScanner";
import { formatTime } from "@/utils/timeUtils";
import { supabase } from "@/integrations/supabase/client";

const CleanerDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [activeShift, setActiveShift] = useState<null | {
    startTime: Date;
    timer: number;
    id: string;
  }>(null);
  const [activeCleaning, setActiveCleaning] = useState<null | {
    location: string;
    startTime: Date;
    timer: number;
    paused: boolean;
  }>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [cleaningSummary, setCleaningSummary] = useState({
    location: "",
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
    images: [] as string[]
  });
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<"startShift" | "endShift" | "startCleaning" | "endCleaning">("startShift");

  const [cleaningsHistory, setCleaningsHistory] = useState([
    {
      id: "1",
      location: "Conference Room A",
      date: "2023-08-15",
      startTime: "09:30",
      endTime: "10:05",
      duration: "35m",
      status: "finished with scan",
      images: 2,
      notes: "Cleaned and restocked supplies",
      shiftId: "previous-shift-1",
    },
    {
      id: "2",
      location: "Main Office",
      date: "2023-08-15",
      startTime: "10:30",
      endTime: "11:12",
      duration: "42m",
      status: "finished without scan",
      images: 0,
      notes: "",
      shiftId: "previous-shift-1",
    },
  ]);

  const [shiftsHistory, setShiftsHistory] = useState([
    {
      id: "1",
      date: "2023-08-15",
      startTime: "09:00",
      endTime: "17:00",
      duration: "8h",
      status: "finished with scan",
      cleanings: 5,
    },
    {
      id: "2",
      date: "2023-08-14",
      startTime: "08:30",
      endTime: "16:30",
      duration: "8h",
      status: "finished without scan",
      cleanings: 4,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('cleaning-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Upload error details:", error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('cleaning-images')
        .getPublicUrl(fileName);
      
      console.log("Uploaded image URL:", publicUrl);
      
      setCleaningSummary({
        ...cleaningSummary,
        images: [...cleaningSummary.images, publicUrl]
      });
      
      toast({
        title: "Image Added",
        description: "Your image has been added to the cleaning summary.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImage = (imageUrl?: string) => {
    if (cleaningSummary.images.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can only add up to 5 images per cleaning.",
        variant: "destructive",
      });
      return;
    }
    
    if (imageUrl) {
      setCleaningSummary({
        ...cleaningSummary,
        images: [...cleaningSummary.images, imageUrl]
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...cleaningSummary.images];
    
    const imageToRemove = newImages[index];
    
    const filePath = imageToRemove.split('/').pop();
    
    if (filePath) {
      console.log("Removing file:", filePath);
      supabase.storage
        .from('cleaning-images')
        .remove([filePath])
        .then(({ error }) => {
          if (error) {
            console.error("Error deleting image:", error);
          }
        });
    }
    
    newImages.splice(index, 1);
    
    setCleaningSummary({
      ...cleaningSummary,
      images: newImages
    });
    
    toast({
      title: "Image Removed",
      description: "The image has been removed from the cleaning summary.",
    });
  };

  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    setShowQRScanner(false);

    switch (scannerPurpose) {
      case "startShift":
        completeStartShift(decodedText);
        break;
      case "endShift":
        completeEndShift(true, decodedText);
        break;
      case "startCleaning":
        completeStartCleaning(decodedText);
        break;
      case "endCleaning":
        prepareCleaningSummary(true, decodedText);
        break;
      default:
        break;
    }
  };

  const handleStartShift = () => {
    if (activeShift) {
      toast({
        title: "Shift Already Active",
        description: "You already have an active shift.",
        variant: "destructive",
      });
      return;
    }
    
    setScannerPurpose("startShift");
    setShowQRScanner(true);
  };

  const completeStartShift = (qrData: string) => {
    toast({
      title: "Shift Started",
      description: "Your shift has been started successfully after scanning the QR code.",
    });
    
    const newShiftId = `shift-${Date.now()}`;
    
    setActiveShift({
      startTime: new Date(),
      timer: 0,
      id: newShiftId,
    });
    setElapsedTime(0);
  };

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
        () => completeEndShift(withScan)
      );
    } else {
      setScannerPurpose("endShift");
      setShowQRScanner(true);
    }
  };

  const completeEndShift = (withScan: boolean, qrData?: string) => {
    toast({
      title: "Shift Ended",
      description: `Your shift has been ended ${withScan ? 'with' : 'without'} a scan.`,
    });

    const newShift = {
      id: (shiftsHistory.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: activeShift!.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      duration: `${Math.floor(elapsedTime / 3600)}h ${Math.floor((elapsedTime % 3600) / 60)}m`,
      status: withScan ? "finished with scan" : "finished without scan",
      cleanings: 0,
    };

    setShiftsHistory([newShift, ...shiftsHistory]);
    setActiveShift(null);
    setElapsedTime(0);
  };

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

    setScannerPurpose("startCleaning");
    setShowQRScanner(true);
  };

  const completeStartCleaning = (qrData: string) => {
    const locationFromQR = qrData.includes("location=") 
      ? qrData.split("location=")[1].split("&")[0] 
      : "Conference Room B";

    toast({
      title: "Cleaning Started",
      description: "Your cleaning task has been started after scanning the QR code.",
    });

    setActiveCleaning({
      location: locationFromQR,
      startTime: new Date(),
      timer: 0,
      paused: false,
    });
    setCleaningElapsedTime(0);
    setActiveTab("cleaning");
  };

  const handlePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });

    toast({
      title: activeCleaning.paused ? "Cleaning Resumed" : "Cleaning Paused",
      description: activeCleaning.paused ? "You have resumed the cleaning." : "You have paused the cleaning.",
    });
  };

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
        () => prepareCleaningSummary(withScan)
      );
    } else {
      setScannerPurpose("endCleaning");
      setShowQRScanner(true);
    }
  };

  const prepareCleaningSummary = (withScan: boolean, qrData?: string) => {
    setCleaningSummary({
      location: activeCleaning!.location,
      startTime: activeCleaning!.startTime.toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: formatTime(cleaningElapsedTime),
      notes: "",
      images: []
    });
    
    setSummaryNotes("");
    setShowSummary(true);
  };

  const handleCompleteSummary = () => {
    const newCleaning = {
      id: (cleaningsHistory.length + 1).toString(),
      location: activeCleaning!.location,
      date: new Date().toISOString().split('T')[0],
      startTime: activeCleaning!.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
      status: `finished with scan`,
      images: cleaningSummary.images.length,
      notes: summaryNotes,
      shiftId: activeShift?.id,
    };

    setCleaningsHistory([newCleaning, ...cleaningsHistory]);
    setActiveCleaning(null);
    setCleaningElapsedTime(0);
    setShowSummary(false);
    setActiveTab("home");
    
    toast({
      title: "Cleaning Completed",
      description: "Your cleaning summary has been saved.",
    });
  };

  useEffect(() => {
    let interval: number | null = null;
    
    if (activeShift && !interval) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift]);

  useEffect(() => {
    let interval: number | null = null;
    
    if (activeCleaning && !activeCleaning.paused && !interval) {
      interval = window.setInterval(() => {
        setCleaningElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCleaning]);

  const showConfirmationDialog = (title: string, description: string, action: () => void) => {
    setConfirmAction({
      title,
      description,
      action
    });
    setShowConfirmDialog(true);
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
                    onPauseCleaning={handlePauseCleaning}
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
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <CleaningSummaryDialog 
        open={showSummary}
        onOpenChange={setShowSummary}
        cleaningSummary={cleaningSummary}
        summaryNotes={summaryNotes}
        onSummaryNotesChange={setSummaryNotes}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        onCompleteSummary={handleCompleteSummary}
      />

      <ConfirmationDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        onConfirm={() => confirmAction?.action && confirmAction.action()}
      />

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default CleanerDashboard;
