import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutToggleProps {
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
}

export function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  return (
    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onLayoutChange("grid")}
        className={cn(
          "h-8 w-8 rounded-md transition-colors",
          layout === "grid" && "bg-card shadow-soft text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onLayoutChange("list")}
        className={cn(
          "h-8 w-8 rounded-md transition-colors",
          layout === "list" && "bg-card shadow-soft text-foreground"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}