
import { Link } from "react-router-dom";
import { Home, Clipboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CleanerNavigationProps {
  active: "home" | "cleaning" | "profile";
}

const CleanerNavigation = ({ active }: CleanerNavigationProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/cleaners/dashboard" },
    { id: "cleaning", label: "Cleaning", icon: Clipboard, path: "/cleaners/cleaning" },
    { id: "profile", label: "Profile", icon: User, path: "/cleaners/profile" },
  ];

  return (
    <nav className="bg-background rounded-lg shadow-sm border">
      <div className="flex">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              "flex-1 py-3 flex flex-col items-center justify-center transition-colors",
              active === item.id 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default CleanerNavigation;
