
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cleaning } from "@/types/cleaning";

export function useDashboardTabs(activeCleaning: Cleaning | null) {
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();

  const handleStartCleaning = (
    activeShift: boolean,
    hasActiveCleaning: boolean,
    onOpenScanner: (purpose: "startCleaning") => void
  ) => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You need to start a shift before you can begin cleaning.",
        variant: "destructive",
      });
      return;
    }

    if (hasActiveCleaning) {
      toast({
        title: "Cleaning Already Active",
        description: "You already have an active cleaning. Please finish it first.",
        variant: "destructive",
      });
      return;
    }

    onOpenScanner("startCleaning");
  };

  return {
    activeTab,
    setActiveTab,
    handleStartCleaning,
  };
}
