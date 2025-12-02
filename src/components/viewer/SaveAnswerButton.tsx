import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveAnswerButtonProps {
  isVisible: boolean;
  onSave: () => void;
}

export function SaveAnswerButton({ isVisible, onSave }: SaveAnswerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSave}
      className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
    >
      <Bookmark className="h-3.5 w-3.5" />
      <span>Save</span>
    </Button>
  );
}
