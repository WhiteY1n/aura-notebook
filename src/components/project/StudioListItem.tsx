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
  type: "quiz" | "summary" | "notes";
  createdAt: string;
}

interface StudioListItemProps {
  item: GeneratedItem;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onExport?: (id: string) => void;
}

const typeIcons = {
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
      className="group flex items-center gap-2 p-2 rounded-lg hover:bg-studio-card/50 transition-colors"
    >
      <div className="h-6 w-6 rounded-md bg-studio-card border border-studio-border flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-studio-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.createdAt}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 opacity-100 transition-opacity flex-shrink-0"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {onDuplicate && (
            <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
              <Copy className="h-3.5 w-3.5 mr-2" />
              <span className="text-xs">Duplicate</span>
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={() => onExport(item.id)}>
              <Download className="h-3.5 w-3.5 mr-2" />
              <span className="text-xs">Export</span>
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(item.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              <span className="text-xs">Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}