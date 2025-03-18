
import { useTabManagement } from "@/hooks/useTabManagement";

export function useTabActions() {
  const { activeTab, setActiveTab } = useTabManagement();
  
  return {
    activeTab,
    setActiveTab
  };
}
