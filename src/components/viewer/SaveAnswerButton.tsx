import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveAnswerButtonProps {
  isVisible: boolean;
  onSave: () => void;
}

export function SaveAnswerButton({ isVisible, onSave }: SaveAnswerButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Bookmark className="h-3 w-3" />
            <span>Save</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
