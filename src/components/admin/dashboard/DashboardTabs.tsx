import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, QrCode, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/admin/UserManagement";
import QrCodeGenerator from "@/components/admin/QrCodeGenerator";
import StatCards from "./StatCards";
import RecentActivitiesCard from "./RecentActivitiesCard";
import CleanerWorkHoursCard from "./CleanerWorkHoursCard";
import { DashboardStats } from "@/hooks/useAdminDashboardData";

interface DashboardTabsProps {
  stats: DashboardStats;
  loading: boolean;
  refreshData?: () => void;
}

const DashboardTabs = ({ stats, loading, refreshData }: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
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
        <StatCards stats={stats} loading={loading} />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <RecentActivitiesCard />
          <CleanerWorkHoursCard />
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
  );
};

export default DashboardTabs;
