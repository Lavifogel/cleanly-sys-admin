
import { useState } from "react";

export function useTabManagement() {
  const [activeTab, setActiveTab] = useState("home");
  
  return {
    activeTab,
    setActiveTab
  };
}
