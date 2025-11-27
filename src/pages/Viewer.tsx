import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { ChatMessageBubble, ChatMessage, TypingIndicator } from "@/components/ChatMessageBubble";
import { ChatMessageSkeleton } from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Sparkles, Lightbulb, FileText, Highlighter, Layers, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock document content
const mockDocument = {
  id: "1",
  title: "Introduction to Machine Learning",
  content: `
    Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

    The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide.

    Key Concepts:
    
    1. Supervised Learning
    The algorithm is trained on a labeled dataset, meaning that each training example is paired with an output label. The model learns to predict the output from the input data.

    2. Unsupervised Learning
    The algorithm is given unlabeled data and must find patterns and relationships within the data. Common techniques include clustering and dimensionality reduction.

    3. Reinforcement Learning
    The algorithm learns by interacting with an environment and receiving feedback in the form of rewards or penalties. It aims to learn the optimal behavior to maximize cumulative reward.

    Applications of Machine Learning:
    - Image and speech recognition
    - Natural language processing
    - Recommendation systems
    - Fraud detection
    - Medical diagnosis
    - Autonomous vehicles
  `,
  highlights: [
    { id: "1", text: "Machine learning is a subset of artificial intelligence", page: 1 },
    { id: "2", text: "Supervised Learning - trained on labeled dataset", page: 1 },
    { id: "3", text: "Unsupervised Learning - finds patterns in unlabeled data", page: 1 },
  ],
};

const quickSuggestions = [
  { icon: Sparkles, label: "Summarize", prompt: "Give me a summary of this document" },
  { icon: Lightbulb, label: "Explain Simply", prompt: "Explain this document like I'm 12 years old" },
  { icon: Layers, label: "Key Ideas", prompt: "What are the key ideas in each section?" },
];

export default function Viewer() {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        "Give me a summary of this document": "This document provides a comprehensive introduction to Machine Learning, covering:\n\n• **Definition**: ML is a subset of AI that enables systems to learn from experience automatically.\n\n• **Three main types**: Supervised (labeled data), Unsupervised (pattern finding), and Reinforcement Learning (reward-based).\n\n• **Applications**: Image recognition, NLP, recommendation systems, fraud detection, medical diagnosis, and autonomous vehicles.",
        "Explain this document like I'm 12 years old": "Imagine you have a robot friend that can learn things just like you do!\n\n🤖 **Machine Learning** is like teaching this robot. Instead of telling it exactly what to do, you show it lots of examples and it figures out patterns on its own.\n\n📚 There are three ways to teach:\n1. **With answers** - Like flashcards where you know the answers\n2. **Without answers** - Like sorting toys into groups\n3. **By trying** - Like learning to ride a bike by practicing\n\nCool things it can do: recognize your face in photos, suggest movies you might like, and even help doctors find diseases!",
        "What are the key ideas in each section?": "**Key Ideas by Section:**\n\n📌 **Introduction**\n- ML enables automatic learning from experience\n- Programs access data to learn independently\n\n📌 **Learning Process**\n- Begins with observations/data\n- Finds patterns to improve decisions\n\n📌 **Types of Learning**\n- Supervised: labeled training data\n- Unsupervised: discovers hidden patterns\n- Reinforcement: learns through trial and reward\n\n📌 **Applications**\n- Recognition, NLP, recommendations, fraud detection, healthcare, autonomous systems",
      };

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponses[content] || "I've analyzed the document. The main focus is on machine learning fundamentals, covering the three primary learning paradigms: supervised, unsupervised, and reinforcement learning. Would you like me to elaborate on any specific section?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <TopNav title={mockDocument.title} showSearch={false} />

      <div className="flex-1 flex overflow-hidden">
        {/* Document Preview - Left Side */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <Tabs defaultValue="document" className="flex-1 flex flex-col">
            <div className="border-b border-border px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="document" className="data-[state=active]:bg-secondary">
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="highlights" className="data-[state=active]:bg-secondary">
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="pages" className="data-[state=active]:bg-secondary">
                  <Layers className="h-4 w-4 mr-2" />
                  Pages
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="document" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 max-w-3xl mx-auto">
                  <Card variant="ghost" className="prose prose-slate dark:prose-invert max-w-none">
                    <CardContent className="p-6">
                      <h1 className="text-2xl font-bold mb-4">{mockDocument.title}</h1>
                      <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                        {mockDocument.content}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="highlights" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {mockDocument.highlights.map((highlight) => (
                    <Card key={highlight.id} variant="elevated" className="p-4">
                      <p className="text-foreground">{highlight.text}</p>
                      <p className="text-xs text-muted-foreground mt-2">Page {highlight.page}</p>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="pages" className="flex-1 m-0 overflow-hidden">
              <div className="p-6 text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Page navigation coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Q&A Panel - Right Side */}
        <div className="w-full max-w-md flex flex-col bg-card/50">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Ask AI
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ask questions about this document
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSendMessage(suggestion.prompt)}
                >
                  <suggestion.icon className="h-3 w-3 mr-1" />
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p className="text-muted-foreground">
                  Start a conversation about your document
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about this document..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4">
              <Link to={`/flashcards/${id}`}>
                <Button variant="soft" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
