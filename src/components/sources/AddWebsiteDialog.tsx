import { useState } from "react";
import { Link, Plus, X, Loader2, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface AddWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

const urlSchema = z.string().url("Please enter a valid URL");

interface UrlEntry {
  id: string;
  url: string;
  error?: string;
}

export function AddWebsiteDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: AddWebsiteDialogProps) {
  const { toast } = useToast();
  const [urls, setUrls] = useState<UrlEntry[]>([{ id: crypto.randomUUID(), url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUrl = (url: string): string | null => {
    if (!url.trim()) return "URL is required";
    try {
      urlSchema.parse(url.startsWith("http") ? url : `https://${url}`);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

  const handleUrlChange = (id: string, value: string) => {
    setUrls((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, url: value, error: undefined } : entry
      )
    );
  };

  const addUrlField = () => {
    setUrls((prev) => [...prev, { id: crypto.randomUUID(), url: "" }]);
  };

  const removeUrlField = (id: string) => {
    if (urls.length > 1) {
      setUrls((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const handleSubmit = async () => {
    // Validate all URLs
    const validatedUrls = urls.map((entry) => ({
      ...entry,
      error: validateUrl(entry.url) || undefined,
    }));

    setUrls(validatedUrls);

    const hasErrors = validatedUrls.some((entry) => entry.error);
    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      const validUrls = validatedUrls.filter((entry) => entry.url.trim());

      for (const entry of validUrls) {
        const normalizedUrl = entry.url.startsWith("http")
          ? entry.url
          : `https://${entry.url}`;

        const { error } = await supabase.from("sources").insert({
          project_id: projectId,
          title: extractDomain(normalizedUrl),
          type: "website",
          content: normalizedUrl,
        });

        if (error) {
          throw new Error(`Failed to add ${entry.url}: ${error.message}`);
        }
      }

      toast({
        title: "Websites added",
        description: `${validUrls.length} source${validUrls.length > 1 ? "s" : ""} added successfully`,
      });

      setUrls([{ id: crypto.randomUUID(), url: "" }]);
      onOpenChange(false);
      onSourceAdded?.();
    } catch (error) {
      console.error("Error adding websites:", error);
      toast({
        title: "Failed to add websites",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === urls.length - 1) {
        addUrlField();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Add website links
          </DialogTitle>
          <DialogDescription>
            Add one or more website URLs to use as sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-64 overflow-y-auto">
          {urls.map((entry, index) => (
            <div key={entry.id} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={entry.url}
                    onChange={(e) => handleUrlChange(entry.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="https://example.com"
                    className={cn(
                      "pl-10",
                      entry.error && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {entry.error && (
                  <p className="text-xs text-destructive mt-1">{entry.error}</p>
                )}
              </div>
              {urls.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrlField(entry.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addUrlField}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add another URL
        </Button>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || urls.every((u) => !u.url.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add websites"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
