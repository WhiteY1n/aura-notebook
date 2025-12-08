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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add source</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {sourceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={option.disabled}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-6 rounded-xl",
                  "border-2 border-dashed border-border/60",
                  "bg-muted/30 hover:bg-muted/60 hover:border-primary/40",
                  "transition-all duration-200 group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  {option.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-foreground">
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Empty placeholder for 4th grid item */}
            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/30 bg-muted/10 opacity-40">
              <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-muted-foreground">
                  Coming soon
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  More options
                </p>
              </div>
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
