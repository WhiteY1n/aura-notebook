import { LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LayoutToggleProps {
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
}

export function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={layout} 
      onValueChange={(value) => value && onLayoutChange(value as "grid" | "list")}
      className="bg-secondary/50 rounded-lg p-1"
    >
      <ToggleGroupItem 
        value="grid" 
        aria-label="Grid view"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md h-8 w-8"
      >
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="list" 
        aria-label="List view"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md h-8 w-8"
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}