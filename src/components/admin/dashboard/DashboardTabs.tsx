
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, QrCode, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/admin/user-management/UserManagement";
import QrCodeGenerator from "@/components/admin/QrCodeGenerator";
import StatCards from "./StatCards";
import RecentActivitiesCard from "./RecentActivitiesCard";
import CleanerWorkHoursCard from "./CleanerWorkHoursCard";
import ActivitiesTable from "./ActivitiesTable";
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
            <ActivitiesTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
