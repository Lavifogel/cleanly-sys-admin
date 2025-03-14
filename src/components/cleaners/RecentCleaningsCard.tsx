import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CleaningHistoryItem } from "@/types/cleaning";
import CleaningItem from "./cleaningComponents/CleaningItem";
import ImagePreview from "./cleaningComponents/ImagePreview";
import { formatTime } from "@/utils/timeUtils";
import { Scan } from "lucide-react";

interface RecentCleaningsCardProps {
  cleaningsHistory: CleaningHistoryItem[];
  currentShiftId?: string;
  activeCleaning?: {
    location: string;
    startTime: Date;
  } | null;
  cleaningElapsedTime?: number;
  onStartCleaning?: () => void;
  onActiveCleaningClick?: () => void;
}

const RecentCleaningsCard = ({ 
  cleaningsHistory, 
  currentShiftId,
  activeCleaning,
  cleaningElapsedTime = 0,
  onStartCleaning,
  onActiveCleaningClick
}: RecentCleaningsCardProps) => {
  const [cleaningsWithImages, setCleaningsWithImages] = useState<CleaningHistoryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const filteredCleanings = currentShiftId 
    ? cleaningsWithImages.filter(cleaning => cleaning.shiftId === currentShiftId) 
    : cleaningsWithImages;

  const allCleanings = activeCleaning 
    ? [
        {
          id: "active",
          location: activeCleaning.location,
          date: new Date().toISOString().split('T')[0],
          startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
          endTime: "--:--",
          duration: formatTime(cleaningElapsedTime),
          status: "open",
          images: 0,
          notes: "",
          shiftId: currentShiftId,
          isActive: true,
          elapsedTime: cleaningElapsedTime
        },
        ...filteredCleanings
      ] 
    : filteredCleanings;

  useEffect(() => {
    const fetchCleaningImages = async () => {
      try {
        const { data: files, error } = await supabase.storage
          .from('cleaning-images')
          .list();
          
        if (error) {
          console.error("Error fetching images from storage:", error);
          setCleaningsWithImages(cleaningsHistory);
          return;
        }
          
        console.log("Available files in storage:", files);
          
        const updatedCleanings = cleaningsHistory.map(cleaning => {
          if (cleaning.images > 0 && cleaning.imageUrls) {
            return cleaning;
          } else if (cleaning.images > 0) {
            const mockImageUrls = Array.from({ length: cleaning.images }).map((_, i) => {
              if (files && files.length > i) {
                const { data: { publicUrl } } = supabase.storage
                  .from('cleaning-images')
                  .getPublicUrl(files[i].name);
                return publicUrl;
              }
              return '';
            }).filter(url => url !== '');
              
            return { ...cleaning, imageUrls: mockImageUrls };
          } else {
            return cleaning;
          }
        });
          
        setCleaningsWithImages(updatedCleanings);
      } catch (error) {
        console.error("Error processing storage data:", error);
        setCleaningsWithImages(cleaningsHistory);
      }
    };
      
    fetchCleaningImages();
  }, [cleaningsHistory]);

  const handleCleaningItemClick = (cleaning: CleaningHistoryItem) => {
    if (cleaning.isActive && onActiveCleaningClick) {
      onActiveCleaningClick();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Cleanings</CardTitle>
          <CardDescription>
            {currentShiftId 
              ? "Cleanings completed in your current shift" 
              : "Your cleaning history"}
          </CardDescription>
        </CardHeader>
        
        {onStartCleaning && (
          <div className="px-6 pb-4">
            <Button
              onClick={onStartCleaning}
              className="w-full"
              disabled={!!activeCleaning}
            >
              <Scan className="mr-2 h-4 w-4" />
              {activeCleaning ? "Finish Current Cleaning First" : "Scan to Start Cleaning"}
            </Button>
          </div>
        )}
        
        <CardContent>
          <div className="space-y-4">
            {allCleanings.length > 0 ? (
              allCleanings.map((cleaning) => (
                <CleaningItem 
                  key={cleaning.id} 
                  cleaning={cleaning} 
                  onImageSelect={setSelectedImage}
                  onClick={() => handleCleaningItemClick(cleaning)}
                />
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

      <ImagePreview 
        selectedImage={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  );
};

export default RecentCleaningsCard;
