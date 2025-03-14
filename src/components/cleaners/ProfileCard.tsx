
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";

interface ProfileCardProps {
  disableLogoClick?: boolean;
}

const ProfileCard = ({ disableLogoClick = false }: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Your Profile</CardTitle>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <LogOut className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Sign Out</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" alt="Lavi Fogel" />
            <AvatarFallback>LF</AvatarFallback>
          </Avatar>
          <div className="grid gap-1.5">
            <h3 className="text-lg font-semibold">Lavi Fogel</h3>
            <Badge variant="outline" className="w-fit">Cleaner</Badge>
          </div>
        </div>
        <div className="flex items-center justify-center py-3 pointer-events-none">
          <Logo size="lg" variant="default" disableClick={true} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
