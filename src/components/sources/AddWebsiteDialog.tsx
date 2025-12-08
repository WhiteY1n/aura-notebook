import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSourceAdded?: () => void;
}

const URL_REGEX = /^https?:\/\/.+/i;

export function AddWebsiteDialog({
  open,
  onOpenChange,
  projectId,
  onSourceAdded,
}: AddWebsiteDialogProps) {
  const { toast } = useToast();
  const [textareaValue, setTextareaValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validUrls = useMemo(() => {
    return textareaValue
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => URL_REGEX.test(line));
  }, [textareaValue]);

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const handleSubmit = async () => {
    if (validUrls.length === 0) return;

    setIsSubmitting(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const url of validUrls) {
        const { error } = await supabase.from("sources").insert({
          project_id: projectId,
          title: extractDomain(url),
          type: "website",
          content: url,
        });

        if (error) {
          console.error(`Failed to add ${url}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Websites added",
          description: `${successCount} website${successCount > 1 ? "s" : ""} added${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
        });

        setTextareaValue("");
        onOpenChange(false);
        onSourceAdded?.();
      } else {
        toast({
          title: "Failed to add websites",
          description: "No websites could be added",
          variant: "destructive",
        });
      }
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

  const handleClose = () => {
    if (!isSubmitting) {
      setTextareaValue("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Multiple Website URLs</DialogTitle>
          <DialogDescription>
            Enter multiple website URLs, one per line. Each URL will be scraped as a separate source.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          placeholder={`Enter URLs one per line, for example:\nhttps://example.com\nhttps://another-site.com\nhttps://third-website.org`}
          className="min-h-[150px] font-mono text-sm resize-none"
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={validUrls.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${validUrls.length} Website${validUrls.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
