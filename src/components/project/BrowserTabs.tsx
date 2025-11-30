import { useState } from "react";
import { X, Plus, FileText, Link2, Youtube, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { motion, AnimatePresence } from "framer-motion";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "text" | "url" | "youtube" | "audio";
}

interface BrowserTabsProps {
  sources: Source[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onAddSource?: () => void;
}

const getSourceIcon = (type: Source["type"]) => {
  switch (type) {
    case "pdf":
    case "text":
      return FileText;
    case "url":
      return Link2;
    case "youtube":
      return Youtube;
    case "audio":
      return Music;
    default:
      return FileText;
  }
};

export function BrowserTabs({ sources, activeTab, onTabChange, onCloseTab, onAddSource }: BrowserTabsProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const sourceToDelete = sources.find(s => s.id === deleteConfirmId);

  const handleConfirmDelete = () => {
    if (deleteConfirmId && onCloseTab) {
      onCloseTab(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <div className="flex items-end border-b border-border bg-secondary/30">
        {/* Chat tab (always first) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange("chat")}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium rounded-t-lg border-x border-t transition-all flex items-center gap-2 min-w-[100px]",
            activeTab === "chat"
              ? "bg-card border-border text-foreground z-10"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <span>Chat</span>
          {activeTab === "chat" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-card translate-y-[1px]" />
          )}
        </motion.button>

        {/* Source tabs */}
        <ScrollArea className="flex-1">
          <div className="flex items-end">
            <AnimatePresence mode="popLayout">
              {sources.map((source) => {
                const Icon = getSourceIcon(source.type);
                return (
                  <motion.button
                    key={source.id}
                    initial={{ opacity: 0, scale: 0.9, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onTabChange(source.id)}
                    className={cn(
                      "group relative px-3 py-2.5 text-sm font-medium rounded-t-lg border-x border-t transition-all flex items-center gap-2 max-w-[180px]",
                      activeTab === source.id
                        ? "bg-card border-border text-foreground z-10"
                        : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{source.title}</span>
                    {onCloseTab && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(source.id);
                        }}
                        className="ml-1 p-0.5 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </motion.button>
                    )}
                    {activeTab === source.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-card translate-y-[1px]" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>

        {/* Add source button */}
        {onAddSource && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onAddSource}
              className="mx-2 mb-1.5 h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove source?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{sourceToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
