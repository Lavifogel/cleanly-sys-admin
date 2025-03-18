
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

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
        {/* Static logo design (non-interactive) */}
        <div 
          className="flex items-center justify-center py-3"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 pointer-events-none">
            {/* Logo icon */}
            <div className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 h-10 w-10">
              <Check className="absolute h-3/5 w-3/5" strokeWidth={3} />
              <div className="absolute right-0 bottom-0 -translate-x-px -translate-y-px">
                <Sparkles className="h-2/5 w-2/5 text-amber-300" />
              </div>
            </div>
            {/* Logo text */}
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold tracking-tight leading-none">
                <span className="text-blue-600">Cleaners</span>
                <span className="text-indigo-700">Check</span>
              </span>
              <span className="text-xs text-muted-foreground">Smart Cleaning Management</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
