
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Timer, FileText, ImageIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
  shiftId?: string; 
  imageUrls?: string[];
}

interface RecentCleaningsCardProps {
  cleaningsHistory: CleaningHistoryItem[];
  currentShiftId?: string;
}

const RecentCleaningsCard = ({ 
  cleaningsHistory, 
  currentShiftId 
}: RecentCleaningsCardProps) => {
  // State to store cleanings with image URLs
  const [cleaningsWithImages, setCleaningsWithImages] = useState<CleaningHistoryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filter cleanings to only show those from the current shift if a shift is active
  const filteredCleanings = currentShiftId 
    ? cleaningsWithImages.filter(cleaning => cleaning.shiftId === currentShiftId) 
    : cleaningsWithImages;

  // Fetch images for cleanings when the component mounts or history changes
  useEffect(() => {
    const fetchCleaningImages = async () => {
      try {
        // List all files in the storage bucket
        const { data: files, error } = await supabase.storage
          .from('cleaning-images')
          .list();
          
        if (error) {
          console.error("Error fetching images from storage:", error);
          setCleaningsWithImages(cleaningsHistory);
          return;
        }
          
        console.log("Available files in storage:", files);
          
        // Create a copy of cleanings history with image URLs
        const updatedCleanings = cleaningsHistory.map(cleaning => {
          if (cleaning.images > 0 && cleaning.imageUrls) {
            // If imageUrls are already set, use them
            return cleaning;
          } else if (cleaning.images > 0) {
            // Simulate image URLs - in a real app, you would have a relation 
            // between cleanings and their images in the database
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
                        <Avatar 
                          key={index} 
                          className="h-16 w-16 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(imageUrl)}
                        >
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

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img 
              src={selectedImage || ''} 
              alt="Enlarged view" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentCleaningsCard;
