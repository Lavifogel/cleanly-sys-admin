
import { useState, useEffect } from "react";

export function useTabManagement() {
  const [activeTab, setActiveTab] = useState("home");
  
  useEffect(() => {
    // Check localStorage on component mount
    const savedTab = window.localStorage.getItem('dashboard_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear it after use
      window.localStorage.removeItem('dashboard_active_tab');
    }
    
    // Listen for the custom event to set active tab
    const handleSetActiveTab = (event: CustomEvent) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('set-active-tab', handleSetActiveTab as EventListener);
    
    return () => {
      window.removeEventListener('set-active-tab', handleSetActiveTab as EventListener);
    };
  }, []);
  
  return {
    activeTab,
    setActiveTab
  };
}
