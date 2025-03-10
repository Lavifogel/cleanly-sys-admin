
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clipboard, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
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
              Manage cleaning operations, assign tasks, and monitor cleaners
            </p>
          </div>
          <Button className="mt-4 md:mt-0" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-primary" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Tasks waiting to be assigned or completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Active Cleaners
              </CardTitle>
              <CardDescription>Currently active cleaning staff</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
              <CardDescription>Overall cleaning system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">Normal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Latest cleaning tasks created in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-4 font-medium">
                  <div>Title</div>
                  <div>Status</div>
                  <div>Assigned To</div>
                </div>
                <div className="divide-y">
                  {/* These would be populated with real data */}
                  <div className="grid grid-cols-3 p-4">
                    <div>Clean Conference Room</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    </div>
                    <div>Jane Smith</div>
                  </div>
                  <div className="grid grid-cols-3 p-4">
                    <div>Restock Bathrooms</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                    <div>John Doe</div>
                  </div>
                  <div className="grid grid-cols-3 p-4">
                    <div>Floor Waxing</div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                        Overdue
                      </span>
                    </div>
                    <div>Alex Johnson</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
