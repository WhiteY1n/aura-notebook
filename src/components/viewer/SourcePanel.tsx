import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  File,
  Globe,
  Youtube,
  FileText,
  Plus,
  Trash2,
  Folder,
  ChevronLeft,
  ChevronRight,
  FileAudio,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "text" | "youtube" | "website" | "audio" | "image";
}

interface SourcePanelProps {
  sources: Source[];
  onRemoveSource: (sourceId: string) => void;
  onAddSource: () => void;
  onSelectSource: (sourceId: string) => void;
  selectedSourceId?: string;
}

function getSourceIcon(type: Source["type"]) {
  const icons = {
    pdf: <File className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    website: <Globe className="h-4 w-4" />,
    audio: <FileAudio className="h-4 w-4" />,
    image: <Image className="h-4 w-4" />,
  };
  return icons[type];
}

export function SourcePanel({
  sources,
  onRemoveSource,
  onAddSource,
  onSelectSource,
  selectedSourceId,
}: SourcePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "60px" : "320px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative shrink-0 bg-background border-r border-muted flex flex-col h-full shadow-sm"
      >
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">Sources</span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        {!isCollapsed ? (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {sources.map((source) => (
                  <motion.div
                    key={source.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectSource(source.id)}
                    className={cn(
                      "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      "hover:bg-muted/50 hover:shadow-sm",
                      selectedSourceId === source.id
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "bg-background border border-border/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        selectedSourceId === source.id
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      )}
                    >
                      {getSourceIcon(source.type)}
                    </div>

                    <span
                      className={cn(
                        "flex-1 text-sm font-medium truncate transition-colors",
                        selectedSourceId === source.id
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {source.title}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSourceId(source.id);
                      }}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                        "h-6 w-6 text-muted-foreground hover:text-destructive"
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Source Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={onAddSource}
                  className="w-full h-12 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add source</span>
                </Button>
              </motion.div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-3 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddSource}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </motion.div>

      <AlertDialog
        open={deleteSourceId !== null}
        onOpenChange={(open) => !open && setDeleteSourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this source? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSourceId) {
                  onRemoveSource(deleteSourceId);
                  setDeleteSourceId(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
