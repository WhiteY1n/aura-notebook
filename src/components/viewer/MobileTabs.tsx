import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Folder, Trash2, MessageSquare, Sparkles } from "lucide-react";
import { AddSourceDialog, SourceContentViewer } from "@/components/sources";
import { cn } from "@/lib/utils";
import type { Source } from "./SourcePanel";

interface Citation {
  citation_id: string;
  source_id: string;
  source_title: string;
  source_type: string;
  chunk_index?: number;
  excerpt?: string;
  chunk_lines_from?: number;
  chunk_lines_to?: number;
  clickedAt?: number; // Timestamp to force re-trigger
}

interface MobileTabsProps {
  sources: Source[];
  onRemoveSource: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  selectedSourceId?: string;
  projectId: string;
  onSourceAdded?: () => void;
  highlightedCitation?: Citation | null;
  activeTab: "sources" | "chat" | "studio";
  onTabChange: (tab: "sources" | "chat" | "studio") => void;
  chatContent: React.ReactNode;
  studioContent: React.ReactNode;
}

export function MobileTabs({
  sources,
  onRemoveSource,
  onSelectSource,
  selectedSourceId,
  projectId,
  onSourceAdded,
  highlightedCitation,
  activeTab,
  onTabChange,
  chatContent,
  studioContent,
}: MobileTabsProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedForViewing, setSelectedForViewing] = useState<Source | null>(null);

  // Auto-open source viewer when citation is clicked
  useEffect(() => {
    if (highlightedCitation && activeTab !== "sources") {
      const source = sources.find(s => s.id === highlightedCitation.source_id);
      if (source) {
        setSelectedForViewing(source);
        onTabChange("sources");
      }
    }
  }, [highlightedCitation?.clickedAt]);

  // Update selected source for viewing when highlightedCitation changes and we're already on sources tab
  useEffect(() => {
    if (highlightedCitation && activeTab === "sources") {
      const source = sources.find(s => s.id === highlightedCitation.source_id);
      if (source) {
        setSelectedForViewing(source);
      }
    }
  }, [highlightedCitation, activeTab, sources]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as any)} className="flex flex-col h-full">
        {/* Tab bar at top */}
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-background h-12 p-0 shrink-0">
          <TabsTrigger 
            value="sources" 
            className="flex items-center justify-center gap-2 rounded-none data-[state=active]:bg-primary/10 h-full"
          >
            <Folder className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex items-center justify-center gap-2 rounded-none data-[state=active]:bg-primary/10 h-full"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="studio" 
            className="flex items-center justify-center gap-2 rounded-none data-[state=active]:bg-primary/10 h-full"
          >
            <Sparkles className="h-4 w-4" />
            Studio
          </TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="flex-1 m-0 overflow-hidden">
          {selectedForViewing ? (
            <SourceContentViewer
              sourceTitle={selectedForViewing.title}
              sourceContent={selectedForViewing.content || "No content available"}
              sourceSummary={selectedForViewing.summary}
              sourceUrl={selectedForViewing.url}
              sourceType={selectedForViewing.type}
              onClose={() => setSelectedForViewing(null)}
              highlightedCitation={highlightedCitation}
            />
          ) : (
            <ScrollArea className="h-full">
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
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
          {chatContent}
        </TabsContent>

        {/* Studio Tab */}
        <TabsContent value="studio" className="flex-1 m-0 overflow-hidden">
          {studioContent}
        </TabsContent>
      </Tabs>

      <AddSourceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={projectId}
        onSourceAdded={onSourceAdded}
      />
    </>
  );
}
