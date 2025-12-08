import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, CloudUpload } from "lucide-react";
import { SourcePanel, Source } from "@/components/viewer/SourcePanel";
import { ChatPanel, Message } from "@/components/viewer/ChatPanel";
import { StudioPanel, StudioSheet } from "@/components/project/StudioPanel";
import { GeneratedItem } from "@/components/project/StudioListItem";
import { Button } from "@/components/ui/button";
import { AddSourceDialog } from "@/components/sources";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const mockGeneratedItems: GeneratedItem[] = [
  { id: "1", title: "ML Concepts Flashcards", type: "flashcards", createdAt: "Today" },
  { id: "2", title: "Chapter Summary", type: "summary", createdAt: "Yesterday" },
];

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTheme, isDark } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<{ id: string; title: string } | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>(mockGeneratedItems);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch project and sources
  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (projectError) throw projectError;

        if (!projectData) {
          toast({
            title: "Project not found",
            description: "The project you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setProject({ id: projectData.id, title: projectData.title });

        // Fetch sources
        const { data: sourcesData, error: sourcesError } = await supabase
          .from("sources")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false });

        if (sourcesError) throw sourcesError;

        setSources(
          (sourcesData || []).map((s) => ({
            id: s.id,
            title: s.title,
            type: s.type as Source["type"],
          }))
        );
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error loading project",
          description: "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Real-time subscription for sources
    const channel = supabase
      .channel(`sources-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sources",
          filter: `project_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newSource = payload.new as any;
            setSources((prev) => [
              { id: newSource.id, title: newSource.title, type: newSource.type },
              ...prev,
            ]);
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as any).id;
            setSources((prev) => prev.filter((s) => s.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, navigate, toast]);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        content:
          responses[content] ||
          "I've analyzed your sources. Machine learning is a fascinating field that enables computers to learn from data. The content covers fundamental concepts including supervised learning with labeled data, unsupervised learning for pattern discovery, and reinforcement learning for decision-making. Would you like me to elaborate on any specific topic?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  }, []);

  const handleRemoveSource = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from("sources")
        .delete()
        .eq("id", sourceId);

      if (error) throw error;

      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      if (selectedSourceId === sourceId) {
        setSelectedSourceId(undefined);
      }
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error deleting source",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleSelectSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
  };

  const handleSourceAdded = () => {
    // Sources will be updated via real-time subscription
  };

  const handleDeleteGeneratedItem = (itemId: string) => {
    setGeneratedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const hasSources = sources.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <h1 className="font-semibold text-foreground truncate">
              {project?.title || "Loading..."}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {!isLoading && !hasSources ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center max-w-md"
            >
              <div className="p-6 rounded-full bg-primary/10 mb-6">
                <CloudUpload className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Add a source to get started
              </h2>
              <p className="text-muted-foreground mb-8">
                Upload PDFs, add links, or paste content to begin
              </p>
              <Button
                size="lg"
                onClick={() => setAddDialogOpen(true)}
                className="gap-2"
              >
                <CloudUpload className="h-5 w-5" />
                Upload a source
              </Button>
            </motion.div>
          </div>
        ) : (
          /* Loaded State with Sources */
          <>
            {/* Sources Panel (Left) */}
            <SourcePanel
              sources={sources}
              onRemoveSource={handleRemoveSource}
              onSelectSource={handleSelectSource}
              selectedSourceId={selectedSourceId}
              projectId={id || ""}
              onSourceAdded={handleSourceAdded}
            />

            {/* Chat Panel (Center/Right) */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <ChatPanel
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Studio Panel (Desktop) */}
            <StudioPanel
              projectId={id || ""}
              generatedItems={generatedItems}
              onDeleteItem={handleDeleteGeneratedItem}
            />

            {/* Studio Sheet (Mobile) */}
            <StudioSheet
              projectId={id || ""}
              generatedItems={generatedItems}
              onDeleteItem={handleDeleteGeneratedItem}
            />
          </>
        )}
      </div>

      {/* Add Source Dialog */}
      <AddSourceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={id || ""}
        onSourceAdded={handleSourceAdded}
      />
    </div>
  );
}
