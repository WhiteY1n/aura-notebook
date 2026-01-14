import { useState, useEffect } from "react";
import { Clipboard, Loader2 } from "lucide-react";
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

interface AddCopiedTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

export function AddCopiedTextDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: AddCopiedTextDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-paste from clipboard when dialog opens
  useEffect(() => {
    if (open) {
      const autoPaste = async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            setContent(text);
          }
        } catch {
          // Permission denied or clipboard empty - silently fail
        }
      };
      autoPaste();
    }
  }, [open]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        toast({
          title: "Pasted from clipboard",
        });
      } else {
        toast({
          title: "Clipboard is empty",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Could not read clipboard",
        description: "Please paste manually using Ctrl+V or Cmd+V",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for this content",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please paste or enter some text content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("sources").insert({
        notebook_id: projectId,
        title: title.trim(),
        type: "text",
        content: content.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Text added",
        description: "Your copied text has been added as a source",
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

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      onOpenChange(false);
    }
  };

  const characterCount = content.length;
  const canSubmit = title.trim() && content.trim() && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Copied Text</DialogTitle>
          <DialogDescription>
            This dialog automatically reads from your clipboard. You can also manually paste content below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this content..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
                className="h-8 text-xs gap-1.5"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Paste from Clipboard
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your copied content will appear here..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {characterCount.toLocaleString()} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Copied Text"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
