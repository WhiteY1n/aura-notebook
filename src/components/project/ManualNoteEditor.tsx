"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/useNotes";

interface ManualNoteEditorProps {
  notebookId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function ManualNoteEditor({ notebookId, onBack, onSave }: ManualNoteEditorProps) {
  const { createNote, isCreating } = useNotes(notebookId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!notebookId) return;
    if (!title.trim() && !content.trim()) return;

    createNote(
      {
        title: title || "Untitled note",
        content,
        source_type: "user",
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          onSave();
          onBack();
        },
      }
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">New Note</h3>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
        />
        <Textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          disabled={isCreating}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isCreating}>
          {isCreating ? "Saving..." : "Save"}
        </Button>
      </div>
    </Card>
  );
}
