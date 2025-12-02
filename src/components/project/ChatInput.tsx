import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const suggestions = [
  { icon: "📝", label: "Summarize", prompt: "Give me a comprehensive summary of this content" },
  { icon: "💡", label: "Key ideas", prompt: "What are the main key ideas and takeaways?" },
  { icon: "🧒", label: "Explain simply", prompt: "Explain this like I'm 12 years old" },
  { icon: "❓", label: "Questions", prompt: "Generate study questions based on this content" },
];

export function ChatInput({ onSend, disabled, placeholder = "Ask anything about your sources..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-6 py-3 space-y-3">
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend(suggestion.prompt)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
          >
            <span>{suggestion.icon}</span>
            <span>{suggestion.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Input with arrow inside */}
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={cn(
            "relative flex items-center rounded-2xl bg-secondary/50 border transition-all duration-200",
            isFocused ? "border-primary/50 bg-card shadow-sm" : "border-border/50"
          )}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="pr-2"
          >
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || disabled}
              className={cn(
                "h-8 w-8 rounded-xl transition-all",
                input.trim() 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
