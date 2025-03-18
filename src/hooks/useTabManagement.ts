
import { useState } from "react";

export function useTabManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return {
    activeTab,
    setActiveTab
  };
}
