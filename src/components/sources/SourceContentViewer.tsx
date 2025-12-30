import { useMemo, useEffect, useRef } from 'react';
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

interface Citation {
  citation_id: string;
  source_id: string;
  source_title: string;
  source_type: string;
  chunk_index?: number;
  excerpt?: string;
  chunk_lines_from?: number;
  chunk_lines_to?: number;
}

interface SourceContentViewerProps {
  sourceContent?: string;
  sourceTitle?: string;
  sourceSummary?: string;
  sourceUrl?: string;
  sourceType?: string;
  onClose?: () => void;
  highlightedCitation?: Citation | null;
}

export function SourceContentViewer({ 
  sourceContent, 
  sourceTitle,
  sourceSummary,
  sourceUrl,
  sourceType,
  onClose,
  highlightedCitation,
}: SourceContentViewerProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Split content into lines for better rendering
  const contentLines = useMemo(() => {
    if (!sourceContent) return [];
    return sourceContent.split('\n');
  }, [sourceContent]);

  // Find and highlight the excerpt in the content
  const highlightInfo = useMemo(() => {
    if (!highlightedCitation || !sourceContent) return null;

    const excerpt = highlightedCitation.excerpt;
    if (!excerpt) return null;

    // Find the excerpt position in the content
    const excerptIndex = sourceContent.indexOf(excerpt);
    if (excerptIndex === -1) return null;

    // Calculate line number where excerpt starts
    const beforeExcerpt = sourceContent.substring(0, excerptIndex);
    const lineNumber = beforeExcerpt.split('\n').length - 1;

    return {
      lineNumber,
      excerpt,
      startIndex: excerptIndex,
      endIndex: excerptIndex + excerpt.length,
    };
  }, [highlightedCitation, sourceContent]);

  // Auto-scroll to highlighted text
  useEffect(() => {
    if (highlightRef.current && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          highlightRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }
  }, [highlightInfo]);

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
    <div className="flex flex-col h-full overflow-hidden">
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
          <Accordion type="single" collapsible>
            <AccordionItem value="guide" className="border-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>Source guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 max-h-64 overflow-y-auto">
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
      <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
        <div className="p-6 max-w-4xl">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {contentLines.map((line, idx) => {
              const isHighlightedLine = highlightInfo && idx === highlightInfo.lineNumber;
              
              // If this line contains the highlighted excerpt
              if (isHighlightedLine && highlightInfo.excerpt) {
                const lineStartIndex = contentLines.slice(0, idx).join('\n').length + (idx > 0 ? 1 : 0);
                const excerptStartInLine = highlightInfo.startIndex - lineStartIndex;
                const excerptEndInLine = excerptStartInLine + highlightInfo.excerpt.length;

                // Split line into before, highlight, and after parts
                const before = line.substring(0, excerptStartInLine);
                const highlighted = line.substring(excerptStartInLine, excerptEndInLine);
                const after = line.substring(excerptEndInLine);

                return (
                  <div key={idx} ref={highlightRef} className="text-sm whitespace-pre-wrap break-words mb-1">
                    <span className="text-foreground">{before}</span>
                    <mark className="bg-primary/30 dark:bg-primary/40 text-foreground px-1 rounded">
                      {highlighted}
                    </mark>
                    <span className="text-foreground">{after}</span>
                  </div>
                );
              }

              return (
                <div key={idx} className="text-sm text-foreground whitespace-pre-wrap break-words mb-1">
                  {line || '\n'}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
