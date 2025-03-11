
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, QrCode, Users, ClipboardList, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import UserManagement from "@/components/admin/UserManagement";
import QrCodeGenerator from "@/components/admin/QrCodeGenerator";
import { useToast } from "@/hooks/use-toast";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const { stats, loading, refreshData } = useAdminDashboardData();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage cleaners, assign tasks, and monitor cleaning operations
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              className="hidden md:flex" 
              size="sm"
              onClick={() => toast({
                title: "Coming Soon",
                description: "This feature will be available soon!"
              })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Cleaner
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <BarChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="qrcodes">
              <QrCode className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">QR Codes</span>
            </TabsTrigger>
            <TabsTrigger value="activities">
              <ClipboardList className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cleaners</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.activeCleaners}</div>
                  <p className="text-xs text-muted-foreground">Currently on shift</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Areas Cleaned Today</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.areasCleaned}</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Areas Pending</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.areasPending}</div>
                  <p className="text-xs text-muted-foreground">Not cleaned yet</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Cleaning Time</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : `${stats.avgCleaningTime}m`}</div>
                  <p className="text-xs text-muted-foreground">Per area</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Today's cleaning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 p-4 font-medium">
                      <div>Location</div>
                      <div>Cleaner</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y">
                      {/* Recent activities would be fetched from Supabase in a more complete implementation */}
                      <div className="grid grid-cols-3 p-4">
                        <div>Conference Room A</div>
                        <div>Jane Smith</div>
                        <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 p-4">
                        <div>Main Office</div>
                        <div>John Doe</div>
                        <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 p-4">
                        <div>Cafeteria</div>
                        <div>Mark Johnson</div>
                        <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                            Not Started
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cleaner Work Hours</CardTitle>
                  <CardDescription>Today's shifts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Jane Smith</p>
                        <p className="text-xs text-muted-foreground">8:00 AM - 4:00 PM</p>
                      </div>
                      <div className="text-sm font-medium">8h</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">9:00 AM - 5:00 PM</p>
                      </div>
                      <div className="text-sm font-medium">8h</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mark Johnson</p>
                        <p className="text-xs text-muted-foreground">10:00 AM - 6:00 PM</p>
                      </div>
                      <div className="text-sm font-medium">8h</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage cleaners and their accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcodes">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Generator</CardTitle>
                <CardDescription>Create QR codes for shift and cleaning areas</CardDescription>
              </CardHeader>
              <CardContent>
                <QrCodeGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Activities Log</CardTitle>
                <CardDescription>Track all cleaning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Date</div>
                    <div>Location</div>
                    <div>Cleaner</div>
                    <div>Duration</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y">
                    {/* Activities log would be fetched from Supabase in a more complete implementation */}
                    <div className="grid grid-cols-5 p-4">
                      <div>Aug 15, 2023</div>
                      <div>Conference Room A</div>
                      <div>Jane Smith</div>
                      <div>35 min</div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 p-4">
                      <div>Aug 15, 2023</div>
                      <div>Main Office</div>
                      <div>John Doe</div>
                      <div>42 min</div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 p-4">
                      <div>Aug 15, 2023</div>
                      <div>Cafeteria</div>
                      <div>Mark Johnson</div>
                      <div>67 min</div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
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

export default AdminDashboard;
