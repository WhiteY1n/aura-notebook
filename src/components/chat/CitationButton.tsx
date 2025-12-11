import { Button } from '@/components/ui/button';

interface CitationButtonProps {
  chunkIndex: number;
  onClick: () => void;
  className?: string;
}

export function CitationButton({ chunkIndex, onClick, className = '' }: CitationButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`inline-flex items-center justify-center w-6 h-6 p-0 ml-1 text-xs font-medium text-primary border-primary hover:bg-primary/10 hover:border-primary rounded-full ${className}`}
    >
      {chunkIndex + 1}
    </Button>
  );
}
