import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SourceContentViewerProps {
  sourceContent?: string;
  sourceTitle?: string;
  sourceSummary?: string;
  sourceUrl?: string;
  sourceType?: string;
  onClose?: () => void;
  highlightedCitation?: {
    citation_id?: string;
    source_id?: string;
    excerpt?: string;
    chunk_lines_from?: number;
    chunk_lines_to?: number;
  } | null;
}

export function SourceContentViewer({ 
  sourceContent, 
  sourceTitle,
  sourceSummary,
  sourceUrl,
  sourceType,
  onClose,
  highlightedCitation: _highlightedCitation,
}: SourceContentViewerProps) {
  // Split content into lines for better rendering
  const contentLines = useMemo(() => {
    if (!sourceContent) return [];
    return sourceContent.split('\n');
  }, [sourceContent]);

  if (!sourceContent) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border/50 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground line-clamp-2">{sourceTitle}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Source Guide Accordion */}
      {sourceSummary && (
        <div className="border-b border-border/50 flex-shrink-0">
          <Accordion type="single" defaultValue="guide" collapsible>
            <AccordionItem value="guide" className="border-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Source guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-sm text-foreground space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="leading-relaxed text-muted-foreground text-sm">{sourceSummary}</p>
                  </div>
                  
                  {/* Show URL for website sources */}
                  {sourceType === 'website' && sourceUrl && (
                    <div>
                      <h4 className="font-medium mb-2">URL</h4>
                      <a 
                        href={sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-sm"
                      >
                        {sourceUrl}
                      </a>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-6 max-w-4xl">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {contentLines.map((line, idx) => (
              <div key={idx} className="text-sm text-foreground whitespace-pre-wrap break-words mb-1">
                {line || '\n'}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
