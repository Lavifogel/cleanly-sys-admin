
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const DashboardHeader = () => {
  const { toast } = useToast();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage cleaners, assign tasks, and monitor cleaning operations
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-2">
        <Button 
          className="hidden md:flex" 
          size="sm"
          onClick={() => toast({
            title: "Coming Soon",
            description: "This feature will be available soon!"
          })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Cleaner
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
