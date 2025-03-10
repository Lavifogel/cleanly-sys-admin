
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, Calendar, BarChart } from "lucide-react";
import { motion } from "framer-motion";

const CleanersDashboard = () => {
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
              View assigned tasks and track your cleaning progress
            </p>
          </div>
          <Button className="mt-4 md:mt-0" variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Log Hours
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Today's Tasks
              </CardTitle>
              <CardDescription>Tasks assigned for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pending
              </CardTitle>
              <CardDescription>Tasks waiting completion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                This Week
              </CardTitle>
              <CardDescription>Tasks scheduled this week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Completion Rate
              </CardTitle>
              <CardDescription>Your task completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">92%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
            <CardDescription>
              Current tasks assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-4 font-medium">
                <div>Title</div>
                <div>Location</div>
                <div>Priority</div>
                <div>Due Date</div>
              </div>
              <div className="divide-y">
                {/* These would be populated with real data */}
                <div className="grid grid-cols-4 p-4">
                  <div>Vacuum Hallway</div>
                  <div>Building A, Floor 2</div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                      High
                    </span>
                  </div>
                  <div>Today, 2:00 PM</div>
                </div>
                <div className="grid grid-cols-4 p-4">
                  <div>Clean Windows</div>
                  <div>Conference Room</div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      Medium
                    </span>
                  </div>
                  <div>Today, 4:00 PM</div>
                </div>
                <div className="grid grid-cols-4 p-4">
                  <div>Empty Trash</div>
                  <div>All Floors</div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      Low
                    </span>
                  </div>
                  <div>Tomorrow, 9:00 AM</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CleanersDashboard;
