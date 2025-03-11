
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Timer, FileText, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
  shiftId?: string; // Added shiftId to track which shift this cleaning belongs to
  imageUrls?: string[]; // Added to store image URLs
}

interface RecentCleaningsCardProps {
  cleaningsHistory: CleaningHistoryItem[];
  currentShiftId?: string; // Added to filter cleanings by current shift
}

const RecentCleaningsCard = ({ 
  cleaningsHistory, 
  currentShiftId 
}: RecentCleaningsCardProps) => {
  // State to store cleanings with image URLs
  const [cleaningsWithImages, setCleaningsWithImages] = useState<CleaningHistoryItem[]>([]);
  
  // Filter cleanings to only show those from the current shift if a shift is active
  const filteredCleanings = currentShiftId 
    ? cleaningsWithImages.filter(cleaning => cleaning.shiftId === currentShiftId) 
    : cleaningsWithImages;

  // Fetch images for cleanings when the component mounts or history changes
  useEffect(() => {
    const fetchCleaningImages = async () => {
      // Create a copy of cleanings history with image URLs
      const updatedCleanings = await Promise.all(
        cleaningsHistory.map(async (cleaning) => {
          if (cleaning.images > 0) {
            try {
              // In a real app, you would fetch the actual image URLs from your database
              // Here we're simulating it by listing files from the bucket
              const { data, error } = await supabase.storage
                .from('cleaning-images')
                .list();
              
              if (error) {
                console.error("Error fetching images:", error);
                return { ...cleaning, imageUrls: [] };
              }
              
              // Get public URLs for the first N images based on cleaning.images count
              const imageUrls = data
                .slice(0, cleaning.images)
                .map(file => {
                  const { data: { publicUrl } } = supabase.storage
                    .from('cleaning-images')
                    .getPublicUrl(file.name);
                  return publicUrl;
                });
              
              return { ...cleaning, imageUrls };
            } catch (error) {
              console.error("Error processing images:", error);
              return { ...cleaning, imageUrls: [] };
            }
          } else {
            return { ...cleaning, imageUrls: [] };
          }
        })
      );
      
      setCleaningsWithImages(updatedCleanings);
    };
    
    fetchCleaningImages();
  }, [cleaningsHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Cleanings</CardTitle>
        <CardDescription>
          {currentShiftId 
            ? "Cleanings completed in your current shift" 
            : "Your cleaning history"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCleanings.length > 0 ? (
            filteredCleanings.map((cleaning) => (
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
                {cleaning.imageUrls && cleaning.imageUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cleaning.imageUrls.map((imageUrl, index) => (
                      <Avatar key={index} className="h-16 w-16 rounded-md">
                        <AvatarImage 
                          src={imageUrl} 
                          alt={`Cleaning image ${index + 1}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-md bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : cleaning.images > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from({ length: cleaning.images }).map((_, index) => (
                      <Avatar key={index} className="h-16 w-16 rounded-md">
                        <AvatarFallback className="rounded-md bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {currentShiftId 
                ? "No cleanings completed in this shift yet" 
                : "No cleaning history yet"
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCleaningsCard;
