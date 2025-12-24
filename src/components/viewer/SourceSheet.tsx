import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Folder, Trash2, X, ChevronUp } from "lucide-react";
import { AddSourceDialog } from "@/components/sources";
import { SourceContentViewer } from "@/components/sources";
import type { Source } from "./SourcePanel";
import { cn } from "@/lib/utils";

interface SourceSheetProps {
  sources: Source[];
  onRemoveSource: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  selectedSourceId?: string;
  projectId: string;
  onSourceAdded?: () => void;
}

export function SourceSheet({ sources, onRemoveSource, onSelectSource, selectedSourceId, projectId, onSourceAdded }: SourceSheetProps) {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedForViewing, setSelectedForViewing] = useState<Source | null>(null);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="lg:hidden fixed bottom-4 left-4 z-50 shadow-elevated rounded-full px-6 gap-2">
            <ChevronUp className="h-4 w-4" />
            Sources
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">Sources</span>
            </div>
            {/* Built-in close button from SheetContent is shown in the top-right; no custom close here */}
          </div>

          {/* Viewer */}
          {selectedForViewing ? (
            <SourceContentViewer
              sourceTitle={selectedForViewing.title}
              sourceContent={selectedForViewing.content || "No content available"}
              sourceSummary={selectedForViewing.summary}
              sourceUrl={selectedForViewing.url}
              sourceType={selectedForViewing.type}
              onClose={() => setSelectedForViewing(null)}
            />
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {sources.map((source) => (
                      <motion.div
                        key={source.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={cn(
                            "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                            "hover:bg-muted/50 hover:shadow-sm border",
                            selectedSourceId === source.id
                              ? "bg-primary/10 border-primary/20"
                              : "bg-background border-border/40"
                          )}
                          onClick={() => {
                            setSelectedForViewing(source);
                            onSelectSource(source.id);
                          }}
                        >
                          <span className="flex-1 text-sm font-medium truncate">
                            {source.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => { e.stopPropagation(); onRemoveSource(source.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(true)}
                    className="w-full h-12 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 hover:bg-primary/5 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add source</span>
                  </Button>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reuse the same dialog */}
      <AddSourceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={projectId}
        onSourceAdded={onSourceAdded}
      />
    </>
  )
}
