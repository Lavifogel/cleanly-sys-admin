
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileCard = () => {
  return (
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
  );
};

export default ProfileCard;
