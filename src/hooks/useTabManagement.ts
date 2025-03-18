
import { useState, useEffect } from "react";

export function useTabManagement() {
  // Determine which dashboard we're in to use the correct localStorage key
  const isAdminDashboard = window.location.pathname.includes('/admin');
  const storageKey = isAdminDashboard ? "adminActiveTab" : "cleanerActiveTab";
  
  // Set default tab based on which dashboard we're in
  const defaultTab = isAdminDashboard ? "dashboard" : "home";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Persist tab selection in localStorage to maintain state across refreshes
  useEffect(() => {
    const storedTab = localStorage.getItem(storageKey);
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, [storageKey]);
  
  // Update localStorage when tab changes
  useEffect(() => {
    localStorage.setItem(storageKey, activeTab);
  }, [activeTab, storageKey]);
  
  return {
    activeTab,
    setActiveTab
  };
}
