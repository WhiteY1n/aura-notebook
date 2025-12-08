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
import { useNotebooks } from "@/hooks/useNotebooks";
import { useSources } from "@/hooks/useSources";
import { useSourceDelete } from "@/hooks/useSourceDelete";
import { useChatMessages } from "@/hooks/useChatMessages";
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
  const { toast } = useToast();
  
  const { notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { sources: sourcesData, isLoading: sourcesLoading } = useSources(id);
  const { deleteSource } = useSourceDelete();
  const { messages: chatMessages, sendMessage, isSending } = useChatMessages(id);
  
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>(mockGeneratedItems);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const project = notebooks?.find(nb => nb.id === id);
  const isLoading = notebooksLoading || sourcesLoading;
  
  const sources: Source[] = (sourcesData || []).map(s => ({
    id: s.id,
    title: s.title,
    type: s.type as Source["type"],
  }));

  // Transform chat messages to Message format for ChatPanel
  const messages: Message[] = (chatMessages || []).map((msg, index) => {
    const isUser = msg.message.type === 'human';
    let content = '';
    
    if (typeof msg.message.content === 'string') {
      content = msg.message.content;
    } else if (msg.message.content?.segments) {
      // AI message with citations
      content = msg.message.content.segments
        .map(seg => seg.text)
        .join('');
    }

    return {
      id: msg.id?.toString() || index.toString(),
      role: isUser ? 'user' : 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  // Handle notebook not found - but give some time for real-time updates to arrive
  useEffect(() => {
    if (!notebooksLoading && !project && id) {
      // Wait a bit for real-time subscription to update
      const timeoutId = setTimeout(() => {
        // Check again if project still doesn't exist
        const currentProject = notebooks?.find(nb => nb.id === id);
        if (!currentProject) {
          toast({
            title: "Notebook not found",
            description: "The notebook you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [notebooksLoading, project, id, navigate, toast, notebooks]);

  const handleSendMessage = useCallback((content: string) => {
    if (!id) return;
    
    sendMessage(
      {
        message: content,
        notebookId: id,
      },
      {
        onError: (error: any) => {
          console.error('Failed to send message:', error);
          toast({
            title: "Failed to send message",
            description: error.message || "Please try again",
            variant: "destructive",
          });
        },
      }
    );
  }, [id, sendMessage, toast]);

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await deleteSource.mutateAsync(sourceId);
      
      if (selectedSourceId === sourceId) {
        setSelectedSourceId(undefined);
      }
      
      toast({
        title: "Source deleted",
        description: "The source has been removed successfully",
      });
    } catch (error: any) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error deleting source",
        description: error.message || "Something went wrong",
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
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
      <div className="flex-1 flex overflow-hidden">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isLoading && !hasSources ? (
            /* Empty State inside Chat area */
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex-shrink-0 flex items-center justify-end px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Chat</span>
                </div>
              </div>
              
              {/* Empty State Content */}
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
            </div>
          ) : (
            <ChatPanel
              messages={messages}
              isTyping={isSending}
              onSendMessage={handleSendMessage}
              exampleQuestions={project?.example_questions || []}
            />
          )}
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
