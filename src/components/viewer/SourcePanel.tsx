import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Plus, X, Youtube, Globe, Image, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "text" | "youtube" | "website" | "image" | "audio";
}

interface SourcePanelProps {
  sources: Source[];
  onRemoveSource: (id: string) => void;
  onAddSource: () => void;
  onSelectSource: (id: string) => void;
  selectedSourceId?: string;
}

const sourceIcons: Record<Source["type"], typeof FileText> = {
  pdf: FileText,
  text: FileText,
  youtube: Youtube,
  website: Globe,
  image: Image,
  audio: FileAudio,
};

export function SourcePanel({
  sources,
  onRemoveSource,
  onAddSource,
  onSelectSource,
  selectedSourceId,
}: SourcePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setSourceToDelete(sourceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sourceToDelete) {
      onRemoveSource(sourceToDelete);
      setSourceToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const panelVariants = {
    expanded: { width: 320, opacity: 1 },
    collapsed: { width: 48, opacity: 1 },
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={panelVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative h-full bg-background border-r border-border/50 flex flex-col shadow-sm"
      >
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full bg-background border border-border shadow-sm hover:bg-secondary"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4 gap-2"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                Sources ({sources.length})
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Sources</h2>
                  <span className="text-sm text-muted-foreground">
                    {sources.length}
                  </span>
                </div>
              </div>

              {/* Sources List */}
              <ScrollArea className="flex-1 px-2 py-2">
                <div className="space-y-1">
                  {sources.map((source) => {
                    const Icon = sourceIcons[source.type];
                    return (
                      <motion.div
                        key={source.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => onSelectSource(source.id)}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                          selectedSourceId === source.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary/80"
                        )}
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            selectedSourceId === source.id
                              ? "bg-primary/20"
                              : "bg-secondary"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium truncate">
                          {source.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleDeleteClick(e, source.id)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Add Source Button */}
              <div className="p-3 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={onAddSource}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add source
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove source?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this source? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
