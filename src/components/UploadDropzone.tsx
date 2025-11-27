import { useState, useCallback } from "react";
import { Upload, File, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadDropzoneProps {
  onUpload?: (files: File[]) => void;
  onUrlSubmit?: (url: string) => void;
  className?: string;
  compact?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/*",
  "audio/*",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadDropzone({ onUpload, onUrlSubmit, className, compact = false }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.size <= MAX_SIZE
    );
    
    if (files.length > 0) {
      onUpload?.(files);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.size <= MAX_SIZE
    );
    
    if (files.length > 0) {
      onUpload?.(files);
    }
  }, [onUpload]);

  const handleUrlSubmit = useCallback(() => {
    if (url.trim()) {
      onUrlSubmit?.(url.trim());
      setUrl("");
      setDialogOpen(false);
    }
  }, [url, onUrlSubmit]);

  if (compact) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">Add URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <label
                className={cn(
                  "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileSelect}
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, Text, Images, Audio (max 50MB)
                </p>
              </label>
            </TabsContent>
            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="YouTube URL or website link..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                />
                <Button onClick={handleUrlSubmit} disabled={!url.trim()}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports YouTube links and website URLs
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-secondary/30",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <input
          type="file"
          className="hidden"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileSelect}
        />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Support for PDF, Word, Text, Images, and Audio files. Max size 50MB per file.
        </p>
      </label>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="mt-6 flex gap-2">
        <Input
          placeholder="Paste YouTube or website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          className="flex-1"
        />
        <Button onClick={handleUrlSubmit} disabled={!url.trim()} variant="secondary">
          <LinkIcon className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>
    </div>
  );
}
