import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

interface SaveToNoteButtonProps {
  content: string | { segments: any[]; citations: any[] };
  notebookId?: string;
  onSaved?: () => void;
}

export function SaveToNoteButton({ content, notebookId, onSaved }: SaveToNoteButtonProps) {
  const { createNote, isCreating } = useNotes(notebookId);

  const handleSaveToNote = () => {
    if (!notebookId) return;
    
    let contentText: string;
    let title: string;
    let source_type: 'user' | 'ai_response' = 'ai_response';
    let extracted_text: string | undefined;
    
    // Check if this is an AI response with structured content (object with segments)
    const isAIResponse = typeof content === 'object' && content && 'segments' in content && Array.isArray(content.segments);
    
    if (isAIResponse) {
      contentText = JSON.stringify(content);
      const firstSegmentText = content.segments[0]?.text || 'AI Response';
      title = firstSegmentText.length > 50 ? firstSegmentText.substring(0, 47) + '...' : firstSegmentText;
      source_type = 'ai_response';
      
      extracted_text = content.segments
        .slice(0, 3)
        .map((segment: any) => segment.text)
        .join(' ')
        .substring(0, 200);
    } else {
      const contentString = typeof content === 'string' ? content : String(content);
      contentText = contentString;
      const firstLine = contentString.split('\n')[0];
      title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
      source_type = 'user';
      extracted_text = undefined;
    }
    
    createNote({ title, content: contentText, source_type, extracted_text });
    onSaved?.();
  };

  if (!notebookId) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSaveToNote}
      disabled={isCreating}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs h-auto py-1 px-2"
    >
      <FileText className="h-3 w-3" />
      <span>{isCreating ? 'Saving...' : 'Save to note'}</span>
    </Button>
  );
}
