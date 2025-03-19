
import { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ShiftHistoryLoadingSkeleton: FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Shift History</CardTitle>
        <CardDescription>
          Recent shifts and related cleanings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ShiftHistoryLoadingSkeleton;
