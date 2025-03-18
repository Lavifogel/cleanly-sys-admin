
import { useState, useEffect } from "react";

export function useTabManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Persist tab selection in localStorage to maintain state across refreshes
  useEffect(() => {
    const storedTab = localStorage.getItem("adminActiveTab");
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);
  
  // Update localStorage when tab changes
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);
  
  return {
    activeTab,
    setActiveTab
  };
}
