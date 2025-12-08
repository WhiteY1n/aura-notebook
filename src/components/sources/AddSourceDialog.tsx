import { useState } from "react";
import { Upload, Link, Clipboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadFilesDialog } from "./UploadFilesDialog";
import { AddWebsiteDialog } from "./AddWebsiteDialog";
import { AddCopiedTextDialog } from "./AddCopiedTextDialog";
import { cn } from "@/lib/utils";

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

  const handleOptionClick = (optionId: string) => {
    setActiveDialog(optionId);
    onOpenChange(false);
  };

  const handleSubDialogClose = () => {
    setActiveDialog(null);
  };

  const handleSourceAdded = () => {
    setActiveDialog(null);
    onSourceAdded?.();
  };

  return (
    <>
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
              className={cn(
                "w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl",
                "border-2 border-dashed border-border/60",
                "bg-muted/30 hover:bg-muted/60 hover:border-primary/40",
                "transition-all duration-200 group",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-base text-foreground">
                  Upload sources
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop or choose file to upload
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

      <UploadFilesDialog
        open={activeDialog === "upload"}
        onOpenChange={(open) => !open && handleSubDialogClose()}
        projectId={projectId}
        onSourceAdded={handleSourceAdded}
      />

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
