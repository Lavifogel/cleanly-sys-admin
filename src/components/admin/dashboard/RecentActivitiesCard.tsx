
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RecentActivitiesCard = () => {
  return (
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
  );
};

export default RecentActivitiesCard;
