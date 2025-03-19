
import { Cleaning } from "@/types/cleaning";

export function useTogglePauseCleaning(
  activeCleaning: Cleaning | null,
  setActiveCleaning: (cleaning: Cleaning | null) => void
) {
  // Toggle pause/resume of the current cleaning
  const togglePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });
  };

  return { togglePauseCleaning };
}
