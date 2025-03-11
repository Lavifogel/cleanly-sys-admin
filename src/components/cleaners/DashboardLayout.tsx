
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ClipboardCheck, User } from "lucide-react";

interface DashboardLayoutProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  hasActiveCleaning: boolean;
  children: React.ReactNode;
}

const DashboardLayout = ({
  activeTab,
  onTabChange,
  hasActiveCleaning,
  children
}: DashboardLayoutProps) => {
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

        <Tabs defaultValue="home" value={activeTab} onValueChange={onTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="cleaning" disabled={!hasActiveCleaning}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cleaning</span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
