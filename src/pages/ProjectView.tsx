import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, StickyNote, Moon, Sun } from "lucide-react";
import { BrowserTabs, Source } from "@/components/project/BrowserTabs";
import { ChatMessage, Message, TypingIndicator } from "@/components/project/ChatMessage";
import { ChatInput } from "@/components/project/ChatInput";
import { StudioPanel, StudioSheet } from "@/components/project/StudioPanel";
import { GeneratedItem } from "@/components/project/StudioListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

// Mock data
const mockSources: Source[] = [
  { id: "1", title: "ML Fundamentals.pdf", type: "pdf" },
  { id: "2", title: "Research Paper", type: "text" },
  { id: "3", title: "YouTube Lecture", type: "youtube" },
];

const mockGeneratedItems: GeneratedItem[] = [
  { id: "1", title: "ML Concepts Flashcards", type: "flashcards", createdAt: "Today" },
  { id: "2", title: "Chapter Summary", type: "summary", createdAt: "Yesterday" },
];

const mockProject = {
  id: "1",
  title: "Introduction to Machine Learning",
};

export default function ProjectView() {
  const { id } = useParams();
  const { setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("chat");
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>(mockGeneratedItems);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Give me a comprehensive summary of this content": 
          "**Summary of Machine Learning Fundamentals**\n\nMachine learning is a subset of artificial intelligence that enables systems to learn from data automatically. The document covers:\n\n• **Supervised Learning**: Training with labeled data to predict outcomes\n• **Unsupervised Learning**: Finding hidden patterns in unlabeled data\n• **Reinforcement Learning**: Learning through trial and reward\n\nKey applications include image recognition, natural language processing, and autonomous systems.",
        "What are the main key ideas and takeaways?":
          "**Key Takeaways:**\n\n1. **Data is fundamental** - ML models are only as good as their training data\n2. **Three paradigms** - Supervised, unsupervised, and reinforcement learning serve different purposes\n3. **Feature engineering matters** - Proper data preparation significantly impacts model performance\n4. **Overfitting prevention** - Regularization and validation are crucial\n5. **Iterative process** - ML development requires continuous refinement",
        "Explain this like I'm 12 years old":
          "Imagine you have a robot friend that learns just like you do! 🤖\n\n**Machine learning** is teaching computers to figure things out on their own by showing them lots of examples.\n\nIt's like:\n• Teaching your dog tricks by giving treats 🐕\n• Getting better at video games by playing more 🎮\n• Learning to recognize your friends' faces 👤\n\nThe computer looks at patterns and makes guesses, getting smarter each time!",
        "Generate study questions based on this content":
          "**Study Questions:**\n\n1. What is the main difference between supervised and unsupervised learning?\n2. Name three real-world applications of machine learning.\n3. Why is feature engineering important in ML?\n4. What is overfitting and how can it be prevented?\n5. Explain reinforcement learning with an example.\n6. What role does training data play in model accuracy?",
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[content] || "I've analyzed your sources. Machine learning is a fascinating field that enables computers to learn from data. The content covers fundamental concepts including supervised learning with labeled data, unsupervised learning for pattern discovery, and reinforcement learning for decision-making. Would you like me to elaborate on any specific topic?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  }, []);

  const handleDeleteGeneratedItem = (itemId: string) => {
    setGeneratedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCloseSource = (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    if (activeTab === sourceId) {
      setActiveTab("chat");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-semibold text-foreground truncate">{mockProject.title}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Browser Tabs */}
          <BrowserTabs
            sources={sources}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCloseTab={handleCloseSource}
            onAddSource={() => console.log("Add source")}
          />

          {/* Chat/Source Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "chat" ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                        <StickyNote className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground mb-2">
                        Start a conversation
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        Ask questions about your sources or use the suggestions below to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      {isTyping && <TypingIndicator />}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <ChatInput onSend={handleSendMessage} disabled={isTyping} />
              </>
            ) : (
              // Source viewer (placeholder)
              <div className="flex-1 flex items-center justify-center bg-secondary/30">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Source viewer: {sources.find((s) => s.id === activeTab)?.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Document preview would be shown here)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Add Note FAB */}
          <Button
            size="icon"
            className="hidden sm:flex fixed bottom-6 right-6 lg:right-[calc(theme(spacing.96)+1.5rem)] xl:right-[calc(theme(spacing.96)+1.5rem)] h-12 w-12 rounded-full shadow-elevated z-40"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Studio Panel (Desktop) */}
        <StudioPanel
          projectId={id || "1"}
          generatedItems={generatedItems}
          onDeleteItem={handleDeleteGeneratedItem}
        />

        {/* Studio Sheet (Mobile) */}
        <StudioSheet
          projectId={id || "1"}
          generatedItems={generatedItems}
          onDeleteItem={handleDeleteGeneratedItem}
        />
      </div>
    </div>
  );
}