
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CleanerWorkHoursCard = () => {
  return (
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
  );
};

export default CleanerWorkHoursCard;
