import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileIconMapper, FileType } from "./FileIconMapper";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface Document {
  id: string;
  title: string;
  type: FileType;
  lastUpdated: string;
  thumbnail?: string;
}

interface DocumentCardProps {
  document: Document;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function DocumentCard({ document, onRename, onDelete, className }: DocumentCardProps) {
  const navigate = useNavigate();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);

  const handleOpen = () => {
    navigate(`/viewer/${document.id}`);
  };

  const handleRename = () => {
    if (newTitle.trim()) {
      onRename?.(document.id, newTitle.trim());
      setRenameDialogOpen(false);
    }
  };

  const handleDelete = () => {
    onDelete?.(document.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        variant="interactive"
        className={cn("group overflow-hidden", className)}
        onClick={handleOpen}
      >
        <div className="relative aspect-[4/3] bg-secondary/50 flex items-center justify-center overflow-hidden">
          {document.thumbnail ? (
            <img
              src={document.thumbnail}
              alt={document.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-card flex items-center justify-center shadow-soft">
                <FileIconMapper type={document.type} size="lg" />
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="icon-sm" className="shadow-medium">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameDialogOpen(true); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium text-foreground truncate mb-1">
            {document.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Updated {document.lastUpdated}
          </p>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Enter a new name for this document.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{document.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
