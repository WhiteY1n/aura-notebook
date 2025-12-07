import { useState, useCallback } from "react";
import { Upload, File, FileText, FileAudio, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UploadFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

interface FileWithPreview {
  file: File;
  id: string;
  type: "pdf" | "text" | "audio";
}

const ACCEPTED_TYPES = {
  "application/pdf": "pdf",
  "text/plain": "text",
  "text/markdown": "text",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
} as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <File className="h-4 w-4" />;
    case "audio":
      return <FileAudio className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

export function UploadFilesDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: UploadFilesDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return `${file.name}: Unsupported file type`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File exceeds 50MB limit`;
    }
    return null;
  }, []);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          const fileType = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES];
          validFiles.push({
            file,
            id: crypto.randomUUID(),
            type: fileType as "pdf" | "text" | "audio",
          });
        }
      });

      if (errors.length > 0) {
        toast({
          title: "Some files were rejected",
          description: errors.join("\n"),
          variant: "destructive",
        });
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [validateFile, toast]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const fileItem of files) {
        const filePath = `${user.id}/${projectId}/${crypto.randomUUID()}-${fileItem.file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, fileItem.file);

        if (uploadError) {
          throw new Error(`Failed to upload ${fileItem.file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(filePath);

        // Create source record
        const { error: sourceError } = await supabase.from("sources").insert({
          project_id: projectId,
          title: fileItem.file.name,
          type: fileItem.type,
          file_url: urlData.publicUrl,
          file_size: fileItem.file.size,
        });

        if (sourceError) {
          throw new Error(`Failed to save ${fileItem.file.name}: ${sourceError.message}`);
        }
      }

      toast({
        title: "Files uploaded",
        description: `${files.length} source${files.length > 1 ? "s" : ""} added successfully`,
      });

      setFiles([]);
      onOpenChange(false);
      onSourceAdded?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload sources</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all",
            "flex flex-col items-center justify-center gap-4 text-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Drag & drop files here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, TXT, Markdown, MP3, WAV (max 50MB)
            </p>
          </div>
          <label>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.mp3,.wav,application/pdf,text/plain,text/markdown,audio/mpeg,audio/wav"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Browse files</span>
            </Button>
          </label>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/40"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {getFileIcon(fileItem.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeFile(fileItem.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length > 0 ? `(${files.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
