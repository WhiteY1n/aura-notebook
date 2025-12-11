import { useState } from "react";
import { X, ChevronUp } from "lucide-react";
import { StudioToolCard, ToolType } from "./StudioToolCard";
import { NoteListItem } from "./NoteListItem";
import { NoteViewer } from "./NoteViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNotes } from "@/hooks/useNotes";
import { Plus } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  source_type?: string;
  extracted_text?: string;
  created_at: string;
  updated_at?: string;
}

interface StudioPanelProps {
  projectId: string;
  notebookId?: string;
  onAddNote?: () => void;
  onCitationClick?: (citation: any) => void;
}

const tools: ToolType[] = ["flashcards", "quiz", "mindmap", "audio", "summary", "slides"];

// Desktop panel content
function StudioContent({ projectId, notebookId, onAddNote, onCitationClick }: StudioPanelProps) {
  const { notes, deleteNote } = useNotes(notebookId);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  const handleBackToList = () => {
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote.mutate(noteId);
    setSelectedNote(null);
  };

  // Show note viewer if a note is selected
  if (selectedNote) {
    return (
      <NoteViewer
        note={selectedNote}
        onBack={handleBackToList}
        onDelete={() => handleDeleteNote(selectedNote.id)}
        onCitationClick={onCitationClick}
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-foreground">Studio</h2>
          <p className="text-xs text-muted-foreground">AI-powered learning tools</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <StudioToolCard key={tool} type={tool} projectId={projectId} />
          ))}
        </div>

        <Separator className="bg-studio-border" />

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Notes</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddNote}
              className="h-6 px-2 gap-1 text-xs hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {notes && notes.length === 0 ? (
            <div className="text-center py-6 px-2">
              <p className="text-xs text-muted-foreground">No notes yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Save responses from chat to create notes</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notes?.map((note) => (
                <NoteListItem 
                  key={note.id} 
                  note={note}
                  onClick={() => handleNoteClick(note)}
                  onDelete={() => deleteNote.mutate(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// Desktop version
export function StudioPanel(props: StudioPanelProps) {
  return (
    <aside className="hidden lg:block w-80 xl:w-96 bg-studio border-l border-studio-border flex-shrink-0">
      <StudioContent {...props} />
    </aside>
  );
}

// Mobile bottom sheet version
export function StudioSheet(props: StudioPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-elevated rounded-full px-6 gap-2"
        >
          <ChevronUp className="h-4 w-4" />
          Studio
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] bg-studio border-studio-border p-0">
        <StudioContent {...props} />
      </SheetContent>
    </Sheet>
  );
}