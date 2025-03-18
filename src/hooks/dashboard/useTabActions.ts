
import { useTabManagement } from "@/hooks/useTabManagement";

export function useTabActions() {
  const { activeTab, setActiveTab } = useTabManagement();
  
  // Ensure the dashboard tab is shown by default for admin
  // and home tab for cleaners dashboard
  const defaultTab = window.location.pathname.includes('/admin') 
    ? "dashboard" 
    : "home";
  
  if (!activeTab) {
    setActiveTab(defaultTab);
  }
  
  return {
    activeTab: activeTab || defaultTab,
    setActiveTab
  };
}
