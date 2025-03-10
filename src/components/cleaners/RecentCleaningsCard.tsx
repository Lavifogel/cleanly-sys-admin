
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Timer, FileText, ImageIcon } from "lucide-react";

interface CleaningHistoryItem {
  id: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  images: number;
  notes: string;
}

interface RecentCleaningsCardProps {
  cleaningsHistory: CleaningHistoryItem[];
}

const RecentCleaningsCard = ({ cleaningsHistory }: RecentCleaningsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Cleanings</CardTitle>
        <CardDescription>Your cleaning history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cleaningsHistory.length > 0 ? (
            cleaningsHistory.map((cleaning) => (
              <div
                key={cleaning.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      <h4 className="font-medium">{cleaning.location}</h4>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <p>{cleaning.date}</p>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <p>{cleaning.startTime} - {cleaning.endTime}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center bg-primary/10 px-2 py-1 rounded">
                    <Timer className="h-3 w-3 mr-1 text-primary" />
                    {cleaning.duration}
                  </div>
                </div>
                {cleaning.notes && (
                  <div className="flex items-center text-sm">
                    <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p className="text-sm">{cleaning.notes}</p>
                  </div>
                )}
                {cleaning.images > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {cleaning.images} images
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No cleaning history yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCleaningsCard;
