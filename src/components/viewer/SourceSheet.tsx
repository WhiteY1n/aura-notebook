"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SourcePanel, Source } from "./SourcePanel";
import { useState } from "react";

interface SourceSheetProps {
  sources: Source[];
  onRemoveSource: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  selectedSourceId?: string;
  projectId: string;
  onSourceAdded?: () => void;
  highlightedCitation?: any;
}

export function SourceSheet({
  sources,
  onRemoveSource,
  onSelectSource,
  selectedSourceId,
  projectId,
  onSourceAdded,
  highlightedCitation,
}: SourceSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="lg:hidden fixed bottom-4 left-4 z-40 shadow-lg" variant="default" size="sm">
          Sources
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[90vw] sm:w-[420px]">
        <SourcePanel
          sources={sources}
          onRemoveSource={(id) => {
            onRemoveSource(id);
          }}
          onSelectSource={(id) => {
            onSelectSource(id);
          }}
          selectedSourceId={selectedSourceId}
          projectId={projectId}
          onSourceAdded={onSourceAdded}
          highlightedCitation={highlightedCitation}
        />
      </SheetContent>
    </Sheet>
  );
}
