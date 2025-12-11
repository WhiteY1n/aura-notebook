import { Link } from "react-router-dom";
import { Pencil, Layers, HelpCircle, Brain, Headphones, FileText, Presentation, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type ToolType = "flashcards" | "quiz" | "mindmap" | "audio" | "summary" | "slides";

interface StudioToolCardProps {
  type: ToolType;
  projectId: string;
  generatedCount?: number;
  onEdit?: () => void;
}

const toolConfig: Record<ToolType, { 
  icon: LucideIcon; 
  label: string; 
  description: string;
  colorClass: string;
  bgClass: string;
}> = {
  flashcards: {
    icon: Layers,
    label: "Flashcards",
    description: "Study with AI-generated cards",
    colorClass: "text-tool-flashcard",
    bgClass: "bg-tool-flashcard/10",
  },
  quiz: {
    icon: HelpCircle,
    label: "Quiz",
    description: "Test your knowledge",
    colorClass: "text-tool-quiz",
    bgClass: "bg-tool-quiz/10",
  },
  mindmap: {
    icon: Brain,
    label: "Mind Map",
    description: "Visualize concepts",
    colorClass: "text-tool-mindmap",
    bgClass: "bg-tool-mindmap/10",
  },
  audio: {
    icon: Headphones,
    label: "Audio Overview",
    description: "Listen to a summary",
    colorClass: "text-tool-audio",
    bgClass: "bg-tool-audio/10",
  },
  summary: {
    icon: FileText,
    label: "Summary",
    description: "Quick document summary",
    colorClass: "text-tool-summary",
    bgClass: "bg-tool-summary/10",
  },
  slides: {
    icon: Presentation,
    label: "Slide Deck",
    description: "Generate presentations",
    colorClass: "text-tool-slides",
    bgClass: "bg-tool-slides/10",
  },
};

export function StudioToolCard({ type, projectId, generatedCount, onEdit }: StudioToolCardProps) {
  const config = toolConfig[type];
  const Icon = config.icon;

  const getLink = () => {
    switch (type) {
      case "flashcards":
        return `/flashcards/${projectId}`;
      case "summary":
        return `/summary/${projectId}`;
      default:
        return "#";
    }
  };

  return (
    <Link to={getLink()}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="group relative bg-studio-card border border-studio-border rounded-lg p-3 hover:shadow-soft transition-shadow cursor-pointer"
      >
        {/* Edit button */}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="absolute top-1.5 right-1.5 h-6 w-6 opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}

        {/* Icon */}
        <div className={cn("h-8 w-8 rounded-md flex items-center justify-center mb-2", config.bgClass)}>
          <Icon className={cn("h-4 w-4", config.colorClass)} />
        </div>

        {/* Content */}
        <h3 className="font-medium text-foreground text-sm">{config.label}</h3>
      </motion.div>
    </Link>
  );
}