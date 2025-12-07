import { useState } from "react";
import { ClipboardPaste, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasteTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

export function PasteTextDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: PasteTextDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please paste some text content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sourceTitle = title.trim() || `Pasted text - ${new Date().toLocaleDateString()}`;

      const { error } = await supabase.from("sources").insert({
        project_id: projectId,
        title: sourceTitle,
        type: "text",
        content: content.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Text added",
        description: "Your text has been added as a source",
      });

      setTitle("");
      setContent("");
      onOpenChange(false);
      onSourceAdded?.();
    } catch (error) {
      console.error("Error adding text:", error);
      toast({
        title: "Failed to add text",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      toast({
        title: "Pasted from clipboard",
      });
    } catch (error) {
      toast({
        title: "Could not read clipboard",
        description: "Please paste manually using Ctrl+V",
        variant: "destructive",
      });
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5" />
            Paste text
          </DialogTitle>
          <DialogDescription>
            Add text content directly as a source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Meeting notes, Research excerpt..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePasteFromClipboard}
                className="h-7 text-xs gap-1"
              >
                <ClipboardPaste className="h-3 w-3" />
                Paste from clipboard
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your text content here..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {wordCount} words
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add text"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
