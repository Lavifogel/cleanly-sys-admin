
import { FC } from "react";

interface CleaningItemProps {
  cleaning: any;
  getLocationFromNotes: (notes: string) => string;
}

const CleaningItem: FC<CleaningItemProps> = ({ cleaning, getLocationFromNotes }) => {
  return (
    <div className="bg-card p-3 rounded-md border">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{cleaning.qr_codes?.area_name || getLocationFromNotes(cleaning.notes)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(cleaning.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
            {cleaning.end_time && ` - ${new Date(cleaning.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs 
          ${cleaning.status === 'finished with scan' ? 'bg-green-100 text-green-800' : 
            cleaning.status === 'finished without scan' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'}`}
        >
          {cleaning.status}
        </div>
      </div>
      {cleaning.images && cleaning.images.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium mb-1">Images ({cleaning.images.length})</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cleaning.images.map((img: any) => (
              <a 
                key={img.id} 
                href={img.image_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img 
                  src={img.image_url} 
                  alt="Cleaning" 
                  className="h-16 w-16 object-cover rounded border"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      {cleaning.notes && (
        <div className="mt-2 text-xs">
          <p className="font-medium">Notes:</p>
          <p className="text-muted-foreground">{cleaning.notes}</p>
        </div>
      )}
    </div>
  );
};

export default CleaningItem;
