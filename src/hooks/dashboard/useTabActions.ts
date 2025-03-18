
import { useTabManagement } from "@/hooks/useTabManagement";

export function useTabActions() {
  const { activeTab, setActiveTab } = useTabManagement();
  
  // Ensure the dashboard tab is shown by default
  if (!activeTab) {
    setActiveTab("dashboard");
  }
  
  return {
    activeTab: activeTab || "dashboard",
    setActiveTab
  };
}
