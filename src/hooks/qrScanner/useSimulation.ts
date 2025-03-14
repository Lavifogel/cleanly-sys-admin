
import { useState, useEffect } from "react";

interface UseSimulationProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useSimulation = ({ onScanSuccess }: UseSimulationProps) => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Handle simulation progress
  useEffect(() => {
    let interval: number | undefined;
    
    if (simulationActive && simulationProgress < 100) {
      interval = window.setInterval(() => {
        setSimulationProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            // Simulate a successful scan after reaching 100%
            setTimeout(() => {
              // Generate a mock QR code data that includes a properly formatted area ID
              const mockAreas = [
                "Conference Room A", 
                "Bathroom Floor 1", 
                "Kitchen", 
                "Lobby", 
                "Office Suite 101"
              ];
              const mockAreaName = mockAreas[Math.floor(Math.random() * mockAreas.length)];
              const mockAreaId = `${mockAreaName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 10)}`;
              
              // Create a properly formatted QR code JSON string
              const mockData = JSON.stringify({
                areaId: mockAreaId,
                areaName: mockAreaName,
                type: "Shift",
                timestamp: Date.now()
              });
              
              onScanSuccess(mockData);
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive, simulationProgress, onScanSuccess]);

  const startSimulation = () => {
    setSimulationActive(true);
    setSimulationProgress(0);
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setSimulationProgress(0);
  };

  return {
    simulationActive,
    simulationProgress,
    startSimulation,
    resetSimulation
  };
};
