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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { AddSourceDialog, RenameSourceDialog } from "@/components/sources";
import { SourceContentViewer } from "@/components/sources";
import { useSourceDelete } from "@/hooks/useSourceDelete";
import { cn } from "@/lib/utils";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "text" | "youtube" | "website" | "audio" | "image";
  content?: string;
  summary?: string;
  url?: string;
}

interface SourcePanelProps {
  sources: Source[];
  onRemoveSource: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  selectedSourceId?: string;
  selectedSourceForViewing?: Source | null;
  onSourceViewerChange?: (source: Source | null) => void;
  projectId: string;
  onSourceAdded?: () => void;
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
  onSelectSource,
  selectedSourceId,
  selectedSourceForViewing: propSelectedSourceForViewing,
  onSourceViewerChange,
  projectId,
  onSourceAdded,
}: SourcePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSourceForViewing, setSelectedSourceForViewing] = useState<Source | null>(
    propSelectedSourceForViewing || null
  );
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedSourceForRename, setSelectedSourceForRename] = useState<Source | null>(null);
  const { deleteSource, isDeletingSource } = useSourceDelete();

  // Sync with parent prop
  const activeSourceForViewing = propSelectedSourceForViewing !== undefined ? propSelectedSourceForViewing : selectedSourceForViewing;

  const handleSourceClick = (source: Source) => {
    setSelectedSourceForViewing(source);
    onSourceViewerChange?.(source);
  };

  const handleRenameSource = (source: Source) => {
    setSelectedSourceForRename(source);
    setShowRenameDialog(true);
  };

  const handleRemoveSource = (sourceId: string) => {
    setDeleteSourceId(sourceId);
  };

  const confirmDelete = () => {
    if (deleteSourceId) {
      deleteSource(deleteSourceId);
      setDeleteSourceId(null);
    }
  };

  const handleBackToSources = () => {
    setSelectedSourceForViewing(null);
    onSourceViewerChange?.(null);
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "60px" : "320px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative shrink-0 bg-background border-r border-border/60 dark:border-border/40 flex flex-col"
      >
        {/* Show source content viewer if a source is selected for viewing */}
        {activeSourceForViewing ? (
          <SourceContentViewer
            sourceTitle={activeSourceForViewing.title}
            sourceContent={activeSourceForViewing.content || "No content available"}
            sourceSummary={activeSourceForViewing.summary}
            sourceUrl={activeSourceForViewing.url}
            sourceType={activeSourceForViewing.type}
            onClose={handleBackToSources}
          />
        ) : (
          <>
            {/* Header with Collapse Button */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border/50">
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {sources.map((source) => (
                  <motion.div
                    key={source.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          onClick={() => handleSourceClick(source)}
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
                              handleRemoveSource(source.id);
                            }}
                            className={cn(
                              "opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                              "h-6 w-6 text-muted-foreground hover:text-destructive"
                            )}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => handleRenameSource(source)}>
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleRemoveSource(source.id)}>
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
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
                  onClick={() => setAddDialogOpen(true)}
                  className="w-full h-12 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add source</span>
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAddDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
            </>
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
              onClick={confirmDelete}
              disabled={isDeletingSource}
            >
              {isDeletingSource ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameSourceDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        source={selectedSourceForRename}
      />

      <AddSourceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={projectId}
        onSourceAdded={onSourceAdded}
      />
    </>
  );
}
