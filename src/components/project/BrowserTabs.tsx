import { useState } from "react";
import { X, Plus, FileText, Link2, Youtube, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  return (
    <div className="flex items-end border-b border-border bg-secondary/30">
      {/* Chat tab (always first) */}
      <button
        onClick={() => onTabChange("chat")}
        className={cn(
          "relative px-4 py-2.5 text-sm font-medium rounded-t-lg border-x border-t transition-colors flex items-center gap-2 min-w-[100px]",
          activeTab === "chat"
            ? "bg-card border-border text-foreground z-10"
            : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <span>Chat</span>
        {activeTab === "chat" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-card translate-y-[1px]" />
        )}
      </button>

      {/* Source tabs */}
      <ScrollArea className="flex-1">
        <div className="flex items-end">
          {sources.map((source) => {
            const Icon = getSourceIcon(source.type);
            return (
              <button
                key={source.id}
                onClick={() => onTabChange(source.id)}
                className={cn(
                  "group relative px-3 py-2.5 text-sm font-medium rounded-t-lg border-x border-t transition-colors flex items-center gap-2 max-w-[180px]",
                  activeTab === source.id
                    ? "bg-card border-border text-foreground z-10"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{source.title}</span>
                {onCloseTab && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(source.id);
                    }}
                    className="ml-1 p-0.5 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {activeTab === source.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-card translate-y-[1px]" />
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>

      {/* Add source button */}
      {onAddSource && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onAddSource}
          className="mx-2 mb-1.5 h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}