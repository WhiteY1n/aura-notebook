import { useState } from "react";
import { X, ChevronUp } from "lucide-react";
import { StudioToolCard, ToolType } from "./StudioToolCard";
import { StudioListItem, GeneratedItem } from "./StudioListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface StudioPanelProps {
  projectId: string;
  generatedItems: GeneratedItem[];
  onDeleteItem?: (id: string) => void;
}

const tools: ToolType[] = ["flashcards", "quiz", "mindmap", "audio", "summary", "slides"];

// Desktop panel content
function StudioContent({ projectId, generatedItems, onDeleteItem }: StudioPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">Studio</h2>
          <p className="text-sm text-muted-foreground">AI-powered learning tools</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <StudioToolCard key={tool} type={tool} projectId={projectId} />
          ))}
        </div>

        <Separator className="bg-studio-border" />

        {/* Generated Items */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Generated</h3>
          {generatedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items generated yet. Use the tools above to create study materials.
            </p>
          ) : (
            <div className="space-y-1">
              {generatedItems.map((item) => (
                <StudioListItem key={item.id} item={item} onDelete={onDeleteItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// Desktop version
export function StudioPanel(props: StudioPanelProps) {
  return (
    <aside className="hidden lg:block w-80 xl:w-96 bg-studio border-l border-studio-border flex-shrink-0">
      <StudioContent {...props} />
    </aside>
  );
}

// Mobile bottom sheet version
export function StudioSheet(props: StudioPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-elevated rounded-full px-6 gap-2"
        >
          <ChevronUp className="h-4 w-4" />
          Studio
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] bg-studio border-studio-border p-0">
        <StudioContent {...props} />
      </SheetContent>
    </Sheet>
  );
}