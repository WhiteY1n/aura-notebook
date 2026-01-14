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
import { useSources } from "@/hooks/useSources";

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
  const { addSourceAsync } = useSources(projectId);

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
      console.log('Creating sources for multiple websites:', validUrls.length);
      console.log('URLs:', validUrls);
      console.log('Project ID:', projectId);
      
      // Create sources using addSourceAsync (first one will trigger generation)
      const createdSources: Awaited<ReturnType<typeof addSourceAsync>>[] = [];
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];
        console.log(`Creating source ${i + 1}/${validUrls.length}:`, url);
        
        const source = await addSourceAsync({
          notebookId: projectId,
          title: `Website ${i + 1}: ${extractDomain(url)}`,
          type: 'website',
          url: url,  // Use url field, not content
          processing_status: 'processing',
          metadata: {
            originalUrl: url,
            webhookProcessed: true
          }
        });
        
        createdSources.push(source);
        console.log(`Source ${i + 1} created:`, source.id);
      }
      
      console.log('All sources created successfully:', createdSources.length);

      // Send to webhook endpoint with all source IDs
      if (createdSources.length > 0) {
        console.log('Calling process-additional-sources edge function...');
        const { data: webhookData, error: webhookError } = await supabase.functions.invoke('process-additional-sources', {
          body: {
            type: 'multiple-websites',
            notebookId: projectId,
            urls: validUrls,
            sourceIds: createdSources.map(source => source.id),
            timestamp: new Date().toISOString()
          }
        });

        if (webhookError) {
          console.error('Webhook error:', webhookError);
          console.error('Webhook error details:', JSON.stringify(webhookError));
          // Don't throw - sources are created, show warning
          toast({
            title: "Partial success",
            description: `${validUrls.length} website${validUrls.length > 1 ? "s" : ""} added but processing may be delayed. Error: ${webhookError.message}`,
            variant: "default",
          });
        } else {
          console.log('Webhook response:', webhookData);
          toast({
            title: "Success",
            description: `${validUrls.length} website${validUrls.length > 1 ? "s" : ""} added and sent for processing`,
          });
        }
      }

      setTextareaValue("");
      onOpenChange(false);
      onSourceAdded?.();
    } catch (error) {
      console.error("Error adding websites:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
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
