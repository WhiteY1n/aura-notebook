import { MoreVertical, Trash2, Download, Copy, FileText, Layers, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export interface GeneratedItem {
  id: string;
  title: string;
  type: "flashcards" | "quiz" | "summary" | "notes";
  createdAt: string;
}

interface StudioListItemProps {
  item: GeneratedItem;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onExport?: (id: string) => void;
}

const typeIcons = {
  flashcards: Layers,
  quiz: HelpCircle,
  summary: FileText,
  notes: FileText,
};

export function StudioListItem({ item, onDelete, onDuplicate, onExport }: StudioListItemProps) {
  const Icon = typeIcons[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-studio-card/50 transition-colors"
    >
      <div className="h-8 w-8 rounded-lg bg-studio-card border border-studio-border flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-studio-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.createdAt}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onDuplicate && (
            <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={() => onExport(item.id)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(item.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}