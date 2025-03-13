
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
              // Generate a mock QR code data based on our use case
              const mockData = `location=Conference Room ${Math.floor(Math.random() * 10) + 1}&timestamp=${Date.now()}`;
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
