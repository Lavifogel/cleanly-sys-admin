
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Clock, Camera, Scan, ClipboardCheck, User, PauseCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      description: "Your shift has been started successfully.",
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

    // In a real app, this would handle QR scanning if withScan is true
    toast({
      title: "Shift Ended",
      description: `Your shift has been ended ${withScan ? 'with' : 'without'} a scan.`,
    });

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
      description: "Your cleaning task has been started.",
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

    // In a real app, this would handle QR scanning if withScan is true
    toast({
      title: "Cleaning Finished",
      description: "Please add summary information for this cleaning.",
    });

    // In a real app, this would go to cleaning summary page
    // For now, we'll just add it to history and reset
    const newCleaning = {
      id: (cleaningsHistory.length + 1).toString(),
      location: activeCleaning.location,
      date: new Date().toISOString().split('T')[0],
      startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
      status: `finished ${withScan ? 'with' : 'without'} scan`,
      images: 0,
      notes: "",
    };

    setCleaningsHistory([newCleaning, ...cleaningsHistory]);
    setActiveCleaning(null);
    setCleaningElapsedTime(0);
    setActiveTab("home");
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            {activeShift ? (
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
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Start Your Shift</CardTitle>
                  <CardDescription>
                    Scan a QR code to begin your shift
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleStartShift} className="w-full">
                    <Scan className="mr-2 h-4 w-4" />
                    Scan to Start Shift
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeShift && (
              <Card>
                <CardHeader>
                  <CardTitle>Cleaning Tasks</CardTitle>
                  <CardDescription>
                    Manage your cleaning tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleStartCleaning}
                    className="w-full"
                    disabled={!!activeCleaning}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Scan to Start Cleaning
                  </Button>
                </CardContent>
              </Card>
            )}

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
                            <h4 className="font-medium">{cleaning.location}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cleaning.date} • {cleaning.startTime} - {cleaning.endTime}
                            </p>
                          </div>
                          <div className="text-sm font-medium">{cleaning.duration}</div>
                        </div>
                        {cleaning.notes && (
                          <p className="text-sm">{cleaning.notes}</p>
                        )}
                        {cleaning.images > 0 && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Camera className="h-3 w-3 mr-1" />
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
                  <CardTitle>Active Cleaning</CardTitle>
                  <CardDescription>
                    {activeCleaning.location}
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
                      className="w-full"
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
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>View your information and history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Name:</div>
                      <div>John Doe</div>
                      <div className="text-muted-foreground">Phone:</div>
                      <div>+1234567890</div>
                      <div className="text-muted-foreground">Start Date:</div>
                      <div>January 15, 2023</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Shift History</h3>
                    <div className="border rounded-lg divide-y">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">August 15, 2023</div>
                            <div className="text-sm text-muted-foreground">
                              8:00 AM - 4:00 PM
                            </div>
                          </div>
                          <div className="text-sm font-medium">8h</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">August 14, 2023</div>
                            <div className="text-sm text-muted-foreground">
                              8:00 AM - 4:00 PM
                            </div>
                          </div>
                          <div className="text-sm font-medium">8h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CleanerDashboard;
