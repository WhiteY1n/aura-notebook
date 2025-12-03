import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, StickyNote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "@/components/project/ChatInput";
import { SaveAnswerButton } from "@/components/viewer/SaveAnswerButton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatPanel({
  messages,
  isTyping,
  onSendMessage,
  disabled = false,
}: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full min-w-0 border-l border-border/60 dark:border-border/40 shadow-inner">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-end px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Chat</span>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="px-6 py-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <StickyNote className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Start a conversation
            </h2>
            <p className="text-muted-foreground max-w-md">
              Ask questions about your sources or use the suggestions below to get
              started.
            </p>
          </motion.div>
        ) : (
          <div className="max-w-screen-lg mx-auto space-y-8 pb-4">
            {messages.map((message) => (
              <ChatMessageWithSave key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          )}
        </div>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 bg-background border-t border-border/60 dark:border-border/40">
        <ChatInput onSend={onSendMessage} disabled={disabled || isTyping} />
      </div>
    </div>
  );
}

function ChatMessageWithSave({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAnswer = () => {
    toast({
      title: "Answer saved",
      description: "This answer has been saved to your notes.",
    });
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-2xl shadow-sm transition-shadow hover:shadow-md",
        isUser ? "ml-auto max-w-[85%]" : "max-w-[85%]"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn("flex gap-4 p-4", isUser && "flex-row-reverse")}
      >
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-accent/20 to-primary/20 text-accent"
          )}
        >
          {isUser ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Timestamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="text-xs text-muted-foreground"
          >
            {message.timestamp}
          </motion.div>
        </div>
      </motion.div>

      {/* Actions - Bottom left for assistant messages */}
      {!isUser && (
        <div className="flex items-center gap-2 px-4 pb-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className={cn(
              "h-7 w-7 text-muted-foreground hover:text-foreground transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          <div
            className={cn(
              "transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <SaveAnswerButton isVisible={true} onSave={handleSaveAnswer} />
          </div>
        </div>
      )}
    </Card>
  );
}

function TypingIndicator() {
  return (
    <Card className="max-w-[85%] rounded-2xl shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 p-4"
      >
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </motion.div>
    </Card>
  );
}
