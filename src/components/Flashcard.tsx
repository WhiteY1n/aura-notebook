import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FlashcardProps {
  card: FlashcardData;
  className?: string;
}

export function Flashcard({ card, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("perspective-1000 h-52 cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl border bg-card shadow-soft p-6 flex flex-col justify-center items-center text-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {card.category && (
            <Badge variant="secondary" className="absolute top-3 left-3 text-xs">
              {card.category}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground mb-2">Question</p>
          <p className="font-medium text-foreground">{card.question}</p>
          <p className="text-xs text-muted-foreground mt-4">Click to reveal</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl border bg-primary text-primary-foreground shadow-soft p-6 flex flex-col justify-center items-center text-center"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          {card.category && (
            <Badge variant="secondary" className="absolute top-3 left-3 text-xs bg-primary-foreground/20 text-primary-foreground border-0">
              {card.category}
            </Badge>
          )}
          <p className="text-sm text-primary-foreground/70 mb-2">Answer</p>
          <p className="font-medium">{card.answer}</p>
        </div>
      </motion.div>
    </div>
  );
}
