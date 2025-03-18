
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
