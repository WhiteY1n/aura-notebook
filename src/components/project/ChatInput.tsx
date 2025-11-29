import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="border-t border-border bg-card/50 p-4 space-y-3">
      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => onSend(suggestion.prompt)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
          >
            <span>{suggestion.icon}</span>
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[48px] max-h-[200px] resize-none pr-12 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-card transition-colors"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="absolute right-2 bottom-2 h-8 w-8 rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}