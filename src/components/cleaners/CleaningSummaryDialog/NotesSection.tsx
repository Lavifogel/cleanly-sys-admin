
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  summaryNotes: string;
  onSummaryNotesChange: (notes: string) => void;
}

const NotesSection = ({ summaryNotes, onSummaryNotesChange }: NotesSectionProps) => {
  return (
    <div>
      <label className="text-sm font-medium">Add Notes (Optional)</label>
      <Textarea 
        placeholder="Enter any notes about the cleaning (optional)" 
        value={summaryNotes}
        onChange={(e) => onSummaryNotesChange(e.target.value)}
        className="mt-1"
      />
    </div>
  );
};

export default NotesSection;
