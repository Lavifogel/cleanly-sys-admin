
import { useState } from "react";
import { CleaningSummary } from "@/types/cleaning";

export function useCleaningSummaryState() {
  // Summary related state
  const [cleaningSummary, setCleaningSummary] = useState<CleaningSummary>({
    location: "",
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
    images: []
  });
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  return {
    cleaningSummary,
    setCleaningSummary,
    summaryNotes,
    setSummaryNotes,
    showSummary,
    setShowSummary
  };
}
