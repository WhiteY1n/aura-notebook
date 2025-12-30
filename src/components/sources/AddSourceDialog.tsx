import { useState, useRef } from "react";
import { Upload, Link, Clipboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddWebsiteDialog } from "./AddWebsiteDialog";
import { AddCopiedTextDialog } from "./AddCopiedTextDialog";
import { cn } from "@/lib/utils";
import { useSources } from "@/hooks/useSources";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useNotebookGeneration } from "@/hooks/useNotebookGeneration";
import { useToast } from "@/hooks/use-toast";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

interface SourceOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled?: boolean;
}

const sourceOptions: SourceOption[] = [
  {
    id: "upload",
    icon: <Upload className="h-6 w-6" />,
    label: "Upload sources",
    description: "Drag & drop or browse",
  },
  {
    id: "website",
    icon: <Link className="h-6 w-6" />,
    label: "Link - Website",
    description: "Multiple URLs at once",
  },
  {
    id: "paste",
    icon: <Clipboard className="h-6 w-6" />,
    label: "Paste Text - Copied Text",
    description: "Add copied content",
  },
];

export function AddSourceDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: AddSourceDialogProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { addSourceAsync, updateSource } = useSources(projectId);
  const { uploadFile } = useFileUpload();
  const { processDocumentAsync } = useDocumentProcessing();
  const { generateNotebookContentAsync } = useNotebookGeneration();

  const handleOptionClick = (optionId: string) => {
    if (optionId === "upload") {
      // Trigger file input instead of opening dialog
      fileInputRef.current?.click();
    } else {
      setActiveDialog(optionId);
      onOpenChange(false);
    }
  };

  const handleSubDialogClose = () => {
    setActiveDialog(null);
  };

  const handleSourceAdded = () => {
    setActiveDialog(null);
    onSourceAdded?.();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!projectId) {
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('Processing multiple files with delay strategy:', files.length);

      // Step 1: Create the first source immediately (this will trigger generation if it's the first source)
      const firstFile = files[0];
      const firstFileType = firstFile.type.includes('pdf') 
        ? 'pdf' 
        : firstFile.type.includes('audio') 
        ? 'audio' 
        : 'text';
      
      const firstSourceData = {
        notebookId: projectId,
        title: firstFile.name,
        type: firstFileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
        file_size: firstFile.size,
        processing_status: 'pending',
        metadata: {
          fileName: firstFile.name,
          fileType: firstFile.type,
        },
      };
      
      console.log('Creating first source for:', firstFile.name);
      const firstSource = await addSourceAsync(firstSourceData);
      
      let remainingSources = [];
      
      // Step 2: If there are more files, add a delay before creating the rest
      if (files.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create remaining sources
        remainingSources = await Promise.all(files.slice(1).map(async (file) => {
          const fileType = file.type.includes('pdf') 
            ? 'pdf' 
            : file.type.includes('audio') 
            ? 'audio' 
            : 'text';
          
          const sourceData = {
            notebookId: projectId,
            title: file.name,
            type: fileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
            file_size: file.size,
            processing_status: 'pending',
            metadata: {
              fileName: file.name,
              fileType: file.type,
            },
          };
          console.log('Creating source for:', file.name);
          return await addSourceAsync(sourceData);
        }));
        
        console.log('Remaining sources created:', remainingSources.length);
      }

      // Combine all created sources
      const allCreatedSources = [firstSource, ...remainingSources];
      console.log('All sources created successfully:', allCreatedSources.length);

      // Step 3: Close dialog immediately
      setIsUploading(false);
      onOpenChange(false);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call onSourceAdded callback to trigger refetch
      onSourceAdded?.();

      // Step 4: Show success toast
      toast({
        title: "Files Added",
        description: `${files.length} file${files.length > 1 ? 's' : ''} added and processing started`,
      });

      // Step 5: Process files in background (don't await)
      const processFileAsync = async (file: File, sourceId: string) => {
        try {
          console.log('Starting file processing for:', file.name, 'source:', sourceId);
          const fileType = file.type.includes('pdf') 
            ? 'pdf' 
            : file.type.includes('audio') 
            ? 'audio' 
            : 'text';

          // Update status to uploading
          updateSource({
            sourceId,
            updates: {
              processing_status: 'uploading',
            },
          });

          // Upload the file
          const filePath = await uploadFile(file, projectId, sourceId);
          if (!filePath) {
            throw new Error('File upload failed - no file path returned');
          }
          console.log('File uploaded successfully:', filePath);

          // Update with file path and set to processing
          updateSource({
            sourceId,
            updates: {
              file_path: filePath,
              processing_status: 'processing',
            },
          });

          // Start document processing
          try {
            await processDocumentAsync({
              sourceId,
              filePath,
              sourceType: fileType,
            });

            // Generate notebook content for first file only
            if (sourceId === firstSource.id) {
              await generateNotebookContentAsync({ 
                notebookId: projectId,
                filePath,
                sourceType: fileType,
              });
            }
            
            console.log('Document processing completed for:', sourceId);
          } catch (processingError) {
            console.error('Document processing failed:', processingError);

            // Update to completed with basic info if processing fails
            updateSource({
              sourceId,
              updates: {
                processing_status: 'completed',
              },
            });
          }
        } catch (error) {
          console.error('File processing failed for:', file.name, error);

          // Update status to failed
          updateSource({
            sourceId,
            updates: {
              processing_status: 'failed',
            },
          });
        }
      };

      // Process files in parallel (background)
      const processingPromises = files.map((file, index) => 
        processFileAsync(file, allCreatedSources[index].id)
      );

      // Don't await - let processing happen in background
      Promise.allSettled(processingPromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log('File processing completed:', { successful, failed });

        if (failed > 0) {
          toast({
            title: "Processing Issues",
            description: `${failed} file${failed > 1 ? 's' : ''} had processing issues. Check the sources list for details.`,
            variant: "destructive",
          });
        }
      });

    } catch (error: any) {
      console.error('Error during file upload:', error);
      setIsUploading(false);
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.doc,.docx,.mp3,.wav"
        onChange={handleFileChange}
        className="hidden"
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add sources</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sources let InsightsLM base its responses on the information that matters most to you.
            </p>
            <p className="text-xs text-muted-foreground">
              (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
            </p>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Upload Sources - Large top section */}
            <button
              onClick={() => handleOptionClick("upload")}
              disabled={isUploading}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl",
                "border-2 border-dashed border-border/60",
                "bg-muted/30 hover:bg-muted/60 hover:border-primary/40",
                "transition-all duration-200 group",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-base text-foreground">
                  {isUploading ? "Uploading..." : "Upload sources"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isUploading ? "Processing files, please wait..." : "Click to choose files to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
                </p>
              </div>
            </button>

            {/* Bottom row - Link and Paste Text */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOptionClick("website")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
                  "border border-border/60",
                  "bg-background hover:bg-muted/40 hover:border-primary/40",
                  "transition-all duration-200 group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Link className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-foreground">
                    Link - Website
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multiple URLs at once
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleOptionClick("paste")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
                  "border border-border/60",
                  "bg-background hover:bg-muted/40 hover:border-primary/40",
                  "transition-all duration-200 group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Clipboard className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-foreground">
                    Paste Text - Copied Text
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add copied content
                  </p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddWebsiteDialog
        open={activeDialog === "website"}
        onOpenChange={(open) => !open && handleSubDialogClose()}
        projectId={projectId}
        onSourceAdded={handleSourceAdded}
      />

      <AddCopiedTextDialog
        open={activeDialog === "paste"}
        onOpenChange={(open) => !open && handleSubDialogClose()}
        projectId={projectId}
        onSourceAdded={handleSourceAdded}
      />
    </>
  );
}
