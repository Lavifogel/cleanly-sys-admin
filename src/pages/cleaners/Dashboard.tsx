
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Clock, Camera, Scan, ClipboardCheck, User, PauseCircle, Timer, MapPin, Calendar, FileText, ImageIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CleanerDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [activeShift, setActiveShift] = useState<null | {
    startTime: Date;
    timer: number;
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

  // Sample cleanings history data
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
    },
  ]);

  // Sample shifts history data
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

  // Timer logic for shift and cleaning
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

  // Helper for confirmation dialogs
  const showConfirmationDialog = (title: string, description: string, action: () => void) => {
    setConfirmAction({
      title,
      description,
      action
    });
    setShowConfirmDialog(true);
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
    
    // In a real app, this would scan QR code first
    toast({
      title: "Shift Started",
      description: "Your shift has been started successfully after scanning the QR code.",
    });
    
    setActiveShift({
      startTime: new Date(),
      timer: 0,
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
      completeEndShift(withScan);
    }
  };

  const completeEndShift = (withScan: boolean) => {
    // In a real app, this would handle QR scanning if withScan is true
    toast({
      title: "Shift Ended",
      description: `Your shift has been ended ${withScan ? 'with' : 'without'} a scan.`,
    });

    // Add to shift history
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

    // In a real app, this would scan QR code to get location
    toast({
      title: "Cleaning Started",
      description: "Your cleaning task has been started after scanning the QR code.",
    });

    setActiveCleaning({
      location: "Conference Room B",
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
      prepareCleaningSummary(withScan);
    }
  };

  const prepareCleaningSummary = (withScan: boolean) => {
    // In a real app, this would handle QR scanning if withScan is true
    
    // Prepare cleaning summary
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
    // Update the cleaning summary with notes
    setCleaningSummary({
      ...cleaningSummary,
      notes: summaryNotes
    });

    // In a real app, this would save the cleaning summary to the database
    toast({
      title: "Cleaning Completed",
      description: "Your cleaning summary has been saved.",
    });

    // Add to cleaning history
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
    };

    setCleaningsHistory([newCleaning, ...cleaningsHistory]);
    setActiveCleaning(null);
    setCleaningElapsedTime(0);
    setShowSummary(false);
    setActiveTab("home");
  };

  const handleAddImage = () => {
    // In a real app, this would open the camera to take a picture
    toast({
      title: "Image Added",
      description: "Your image has been added to the cleaning summary.",
    });

    // Simulate adding an image
    if (cleaningSummary.images.length < 5) {
      setCleaningSummary({
        ...cleaningSummary,
        images: [...cleaningSummary.images, `image-${Date.now()}`]
      });
    } else {
      toast({
        title: "Maximum Images Reached",
        description: "You can only add up to 5 images per cleaning.",
        variant: "destructive",
      });
    }
  };

  const renderStartShiftCard = () => (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Start Your Shift</CardTitle>
        <CardDescription>
          Scan a QR code to begin your work day
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-6 bg-primary/10 p-6 rounded-full">
          <Scan className="h-16 w-16 text-primary/80" />
        </div>
        <Button onClick={handleStartShift} className="w-full text-lg py-6" size="lg">
          <Scan className="mr-2 h-5 w-5" />
          Scan to Start Shift
        </Button>
      </CardContent>
    </Card>
  );

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
              {renderStartShiftCard()}
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
                <Card>
                  <CardHeader>
                    <CardTitle>Active Shift</CardTitle>
                    <CardDescription>
                      Started at {activeShift.startTime.toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-2">
                        {formatTime(elapsedTime)}
                      </div>
                      <p className="text-muted-foreground">Elapsed Time</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleEndShift(true)}
                        className="w-full"
                      >
                        <Scan className="mr-2 h-4 w-4" />
                        End Shift with Scan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEndShift(false)}
                        className="w-full"
                      >
                        End Shift without Scan
                      </Button>
                      <Button
                        onClick={handleStartCleaning}
                        className="w-full mt-4"
                      >
                        <Scan className="mr-2 h-4 w-4" />
                        Scan to Start Cleaning
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Cleanings</CardTitle>
                    <CardDescription>Your cleaning history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cleaningsHistory.length > 0 ? (
                        cleaningsHistory.map((cleaning) => (
                          <div
                            key={cleaning.id}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                                  <h4 className="font-medium">{cleaning.location}</h4>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <p>{cleaning.date}</p>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <p>{cleaning.startTime} - {cleaning.endTime}</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded">
                                <Timer className="h-3 w-3 mr-1 text-primary" />
                                {cleaning.duration}
                              </div>
                            </div>
                            {cleaning.notes && (
                              <div className="flex items-center text-sm">
                                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                                <p className="text-sm">{cleaning.notes}</p>
                              </div>
                            )}
                            {cleaning.images > 0 && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                {cleaning.images} images
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No cleaning history yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cleaning" className="space-y-4">
                {activeCleaning && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        {activeCleaning.location}
                      </CardTitle>
                      <CardDescription>
                        Started at {activeCleaning.startTime.toLocaleTimeString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold mb-2">
                          {formatTime(cleaningElapsedTime)}
                        </div>
                        <p className="text-muted-foreground">
                          {activeCleaning.paused ? "PAUSED" : "Elapsed Time"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant={activeCleaning.paused ? "default" : "outline"}
                          onClick={handlePauseCleaning}
                          className="w-full"
                        >
                          <PauseCircle className="mr-2 h-4 w-4" />
                          {activeCleaning.paused ? "Resume Cleaning" : "Pause Cleaning"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleEndCleaning(true)}
                          className="w-full mt-4"
                        >
                          <Scan className="mr-2 h-4 w-4" />
                          Complete with Scan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEndCleaning(false)}
                          className="w-full"
                        >
                          Complete without Scan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Shift History</CardTitle>
                    <CardDescription>View your past shifts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shiftsHistory.map((shift) => (
                        <div key={shift.id} className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-card">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  <h4 className="font-medium">{shift.date}</h4>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <p>{shift.startTime} - {shift.endTime}</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded">
                                <Timer className="h-3 w-3 mr-1 text-primary" />
                                {shift.duration}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground flex items-center">
                              <ClipboardCheck className="h-3 w-3 mr-1" />
                              {shift.cleanings} cleanings completed
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your profile details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">John Doe</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">+1234567890</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="font-medium">January 15, 2023</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium">Cleaner</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </motion.div>

      {/* Cleaning Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cleaning Summary</DialogTitle>
            <DialogDescription>
              Complete your cleaning record
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <h4 className="font-medium">{cleaningSummary.location}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Start:
                </div>
                <div>{cleaningSummary.startTime}</div>
                
                <div className="text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  End:
                </div>
                <div>{cleaningSummary.endTime}</div>
                
                <div className="text-muted-foreground flex items-center">
                  <Timer className="h-3 w-3 mr-1" />
                  Duration:
                </div>
                <div>{cleaningSummary.duration}</div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Add Notes (Optional)</label>
              <Textarea 
                placeholder="Enter any notes about the cleaning" 
                value={summaryNotes}
                onChange={(e) => setSummaryNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Images (Optional)</label>
                <span className="text-xs text-muted-foreground">{cleaningSummary.images.length}/5</span>
              </div>
              
              {cleaningSummary.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {cleaningSummary.images.map((img, index) => (
                    <div key={img} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md text-sm text-muted-foreground">
                  No images added
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={handleAddImage}
                disabled={cleaningSummary.images.length >= 5}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={handleCompleteSummary} className="w-full">
              Complete Cleaning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>
              {confirmAction?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                if (confirmAction?.action) {
                  confirmAction.action();
                }
                setShowConfirmDialog(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CleanerDashboard;
