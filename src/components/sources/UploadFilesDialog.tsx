import { useState, useCallback, useRef } from "react";
import { Upload, File, FileText, FileAudio, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useSources } from "@/hooks/useSources";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useNotebookGeneration } from "@/hooks/useNotebookGeneration";

interface UploadFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

interface FileWithStatus {
  file: File;
  id: string;
  type: "pdf" | "text" | "audio";
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const ACCEPTED_TYPES = {
  "application/pdf": "pdf",
  "text/plain": "text",
  "text/markdown": "text",
  "application/msword": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "pdf",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
} as const;

const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".doc", ".docx", ".mp3", ".wav"];
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

function getFileTypeFromExtension(filename: string): "pdf" | "text" | "audio" | null {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return 'pdf';
    case 'txt':
    case 'md':
      return 'text';
    case 'mp3':
    case 'wav':
      return 'audio';
    default:
      return null;
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
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addSourceAsync, updateSource } = useSources(projectId);
  const { uploadFile } = useFileUpload();
  const { processDocumentAsync } = useDocumentProcessing();
  const { generateNotebookContentAsync } = useNotebookGeneration();

  const validateFile = useCallback((file: File): { valid: boolean; type?: "pdf" | "text" | "audio"; error?: string } => {
    // Check by MIME type first
    if (Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `Exceeds 50MB limit` };
      }
      return { valid: true, type: ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES] as "pdf" | "text" | "audio" };
    }
    
    // Fallback to extension check
    const typeFromExt = getFileTypeFromExtension(file.name);
    if (typeFromExt) {
      if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `Exceeds 50MB limit` };
      }
      return { valid: true, type: typeFromExt };
    }
    
    return { valid: false, error: `Unsupported file type` };
  }, []);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: FileWithStatus[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
        } else {
          // Check for duplicates
          const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size);
          if (!isDuplicate) {
            validFiles.push({
              file,
              id: crypto.randomUUID(),
              type: validation.type!,
              status: "pending",
              progress: 0,
            });
          }
        }
      });

      if (errors.length > 0) {
        toast({
          title: "Some files were rejected",
          description: errors.slice(0, 3).join("\n") + (errors.length > 3 ? `\n...and ${errors.length - 3} more` : ""),
          variant: "destructive",
        });
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [validateFile, toast, files]
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

  const updateFileStatus = (id: string, updates: Partial<FileWithStatus>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const processFileAsync = async (file: File, sourceId: string, notebookId: string, fileItemId: string) => {
    try {
      console.log('Starting file processing for:', file.name, 'source:', sourceId);
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';

      // Update status to uploading
      updateFileStatus(fileItemId, { status: "uploading", progress: 30 });

      // Upload the file
      const filePath = await uploadFile(file, notebookId, sourceId);
      if (!filePath) {
        throw new Error('File upload failed - no file path returned');
      }
      console.log('File uploaded successfully:', filePath);

      updateFileStatus(fileItemId, { progress: 60 });

      // Update with file path and set to processing
      updateSource({
        sourceId,
        updates: {
          file_path: filePath,
          processing_status: 'processing'
        }
      });

      updateFileStatus(fileItemId, { progress: 80 });

      // Start document processing
      try {
        await processDocumentAsync({
          sourceId,
          filePath,
          sourceType: fileType
        });

        // Generate notebook content
        await generateNotebookContentAsync({
          notebookId,
          filePath,
          sourceType: fileType
        });
        console.log('Document processing completed for:', sourceId);
      } catch (processingError) {
        console.error('Document processing failed:', processingError);

        // Update to completed with basic info if processing fails
        updateSource({
          sourceId,
          updates: {
            processing_status: 'completed'
          }
        });
      }

      updateFileStatus(fileItemId, { status: "success", progress: 100 });
    } catch (error) {
      console.error('File processing failed for:', file.name, error);
      updateFileStatus(fileItemId, {
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  const handleUpload = async () => {
    if (!projectId || files.length === 0) return;

    console.log('Processing multiple files:', files.length);
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Step 1: Create the first source immediately
      const firstFile = files[0];
      if (firstFile.status === "success") {
        successCount++;
      } else {
        updateFileStatus(firstFile.id, { status: "uploading", progress: 10 });
        
        const firstFileType = firstFile.type;
        const firstSourceData = {
          notebookId: projectId,
          title: firstFile.file.name,
          type: firstFileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
          file_size: firstFile.file.size,
          processing_status: 'pending' as const,
          metadata: {
            fileName: firstFile.file.name,
            fileType: firstFile.file.type
          }
        };
        
        console.log('Creating first source for:', firstFile.file.name);
        const firstSource = await addSourceAsync(firstSourceData);
        
        // Process first file
        await processFileAsync(firstFile.file, firstSource.id, projectId, firstFile.id);
        successCount++;
      }
      
      // Step 2: If there are more files, add a delay before creating the rest
      if (files.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create and process remaining sources
        for (let i = 1; i < files.length; i++) {
          const fileItem = files[i];
          if (fileItem.status === "success") {
            successCount++;
            continue;
          }

          try {
            updateFileStatus(fileItem.id, { status: "uploading", progress: 10 });
            
            const sourceData = {
              notebookId: projectId,
              title: fileItem.file.name,
              type: fileItem.type as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
              file_size: fileItem.file.size,
              processing_status: 'pending' as const,
              metadata: {
                fileName: fileItem.file.name,
                fileType: fileItem.file.type
              }
            };
            
            const source = await addSourceAsync(sourceData);
            await processFileAsync(fileItem.file, source.id, projectId, fileItem.id);
            successCount++;
          } catch (error) {
            console.error('Failed to process file:', fileItem.file.name, error);
            updateFileStatus(fileItem.id, {
              status: "error",
              progress: 0,
              error: error instanceof Error ? error.message : "Upload failed",
            });
            errorCount++;
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      errorCount++;
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} file${successCount > 1 ? "s" : ""} uploaded${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
      });

      onSourceAdded?.();

      // Close dialog if all succeeded
      if (errorCount === 0) {
        setTimeout(() => {
          setFiles([]);
          onOpenChange(false);
        }, 500);
      }
    } else if (errorCount > 0) {
      toast({
        title: "Upload failed",
        description: "All files failed to upload",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      onOpenChange(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingFiles = files.filter((f) => f.status !== "success");
  const canUpload = pendingFiles.length > 0 && !isUploading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload sources</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
            "flex flex-col items-center justify-center gap-3 text-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.join(",")}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Drag & drop or choose file to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, TXT, Markdown, MP3, WAV • Max 50MB
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  fileItem.status === "success" && "bg-green-500/5 border-green-500/20",
                  fileItem.status === "error" && "bg-destructive/5 border-destructive/20",
                  fileItem.status === "pending" && "bg-muted/50 border-border/40",
                  fileItem.status === "uploading" && "bg-primary/5 border-primary/20"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    fileItem.status === "success" && "bg-green-500/10 text-green-600",
                    fileItem.status === "error" && "bg-destructive/10 text-destructive",
                    (fileItem.status === "pending" || fileItem.status === "uploading") && "bg-primary/10 text-primary"
                  )}
                >
                  {fileItem.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : fileItem.status === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : fileItem.status === "uploading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    getFileIcon(fileItem.type)
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(fileItem.file.size)}
                    </span>
                    {fileItem.status === "error" && fileItem.error && (
                      <span className="text-xs text-destructive truncate">
                        • {fileItem.error}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {fileItem.status === "uploading" && (
                    <Progress value={fileItem.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Remove button */}
                {fileItem.status !== "uploading" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileItem.id);
                    }}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!canUpload}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${pendingFiles.length > 0 ? `${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
