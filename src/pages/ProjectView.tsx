import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, CloudUpload } from "lucide-react";
import { SourcePanel, Source } from "@/components/viewer/SourcePanel";
import { SourceSheet } from "@/components/viewer/SourceSheet";
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
import { useQueryClient } from "@tanstack/react-query";
import { mockGeneratedItems } from "@/mocks/studio";

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTheme, isDark } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { sources: sourcesData, isLoading: sourcesLoading } = useSources(id);
  const { deleteSource } = useSourceDelete();
  const { messages: chatMessages, sendMessage, isSending, deleteChatHistory, isDeletingChatHistory } = useChatMessages(id);
  
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
  const [selectedSourceForViewing, setSelectedSourceForViewing] = useState<Source | null>(null);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>(mockGeneratedItems);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());

  const project = notebooks?.find(nb => nb.id === id);
  const isLoading = notebooksLoading || sourcesLoading;
  
  const sources: Source[] = (sourcesData || []).map(s => ({
    id: s.id,
    title: s.title,
    type: s.type as Source["type"],
    content: s.content,
    summary: s.summary,
    url: s.url,
    processing_status: s.processing_status,
  }));

  // Transform chat messages to Message format for ChatPanel
  const messages: Message[] = (chatMessages || []).map((msg, index) => {
    const isUser = msg.message.type === 'human';
    
    return {
      id: msg.id?.toString() || index.toString(),
      role: isUser ? 'user' : 'assistant',
      content: msg.message.content, // Pass full content (string or object with segments/citations)
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  // Track message count to clear pending message when new messages arrive
  const [lastMessageCount, setLastMessageCount] = useState(0);
  
  useEffect(() => {
    // If we have new messages and we have a pending message, clear it
    if (chatMessages && chatMessages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(chatMessages.length);
  }, [chatMessages.length, lastMessageCount, pendingUserMessage]);

  // Handle notebook not found - but give more time for real-time updates to arrive
  useEffect(() => {
    if (!notebooksLoading && !project && id) {
      // Wait longer for real-time subscription to update (especially for new notebooks)
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
      }, 2000); // Increased to 2 seconds to allow for real-time updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [notebooksLoading, project, id, navigate, toast, notebooks]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!id) return;
    
    try {
      // Show pending message immediately
      setPendingUserMessage(content);
      
      await sendMessage({
        notebookId: id,
        role: 'user',
        content: content,
      });
      
      // Show AI loading after user message is sent
      setShowAiLoading(true);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Clear pending message on error
      setPendingUserMessage(null);
      setShowAiLoading(false);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  }, [id, sendMessage, toast]);

  const handleSourceAdded = useCallback(() => {
    // Invalidate queries to refetch sources and notebook data
    if (id) {
      console.log('Source added, invalidating queries for:', id);
      queryClient.invalidateQueries({ queryKey: ['sources', id] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      queryClient.invalidateQueries({ queryKey: ['notebook', id] });
    }
  }, [id, queryClient]);

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

  const handleDeleteGeneratedItem = (itemId: string) => {
    setGeneratedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearChat = async () => {
    if (!id) return;
    deleteChatHistory(id);
    // Reset clicked questions when chat is cleared
    setClickedQuestions(new Set());
  };

  const handleCitationClick = (citation: any) => {
    // Find the source by source_id from citation
    const source = sources.find(s => s.id === citation.source_id);
    if (source) {
      setSelectedSourceId(source.id);
      setSelectedSourceForViewing(source); // Open source viewer directly
    }
  };

  const handleQuestionClick = useCallback((question: string) => {
    // Add question to clicked set to remove it from display
    setClickedQuestions(prev => new Set(prev).add(question));
  }, []);

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
        {/* Sources Panel (Left) - hidden on mobile */}
        <div className="hidden lg:block">
          <SourcePanel
            sources={sources}
            onRemoveSource={handleRemoveSource}
            onSelectSource={handleSelectSource}
            selectedSourceId={selectedSourceId}
            selectedSourceForViewing={selectedSourceForViewing}
            onSourceViewerChange={setSelectedSourceForViewing}
            projectId={id || ""}
            onSourceAdded={handleSourceAdded}
          />
        </div>

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
              exampleQuestions={project?.example_questions?.filter(q => !clickedQuestions.has(q)) || []}
              onClearChat={handleClearChat}
              isDeletingChatHistory={isDeletingChatHistory}
              onCitationClick={handleCitationClick}
              onQuestionClick={handleQuestionClick}
              notebookId={id}
              notebook={{
                title: project?.title,
                description: project?.description,
                icon: project?.icon,
                generation_status: project?.generation_status,
              }}
              sourceCount={sources.length}
              pendingUserMessage={pendingUserMessage}
              showAiLoading={showAiLoading}
            />
          )}
        </div>

        {/* Studio Panel (Desktop) */}
        <StudioPanel
          projectId={id || ""}
          notebookId={id || ""}
          onAddNote={() => {}}
          onCitationClick={handleCitationClick}
          generatedItems={generatedItems}
          onDeleteItem={handleDeleteGeneratedItem}
        />

        {/* Mobile Sheets */}
        <SourceSheet
          sources={sources}
          onRemoveSource={handleRemoveSource}
          onSelectSource={handleSelectSource}
          selectedSourceId={selectedSourceId}
          projectId={id || ""}
          onSourceAdded={handleSourceAdded}
        />
        {/* Studio Sheet (Mobile) */}
        <StudioSheet
          projectId={id || ""}
          notebookId={id || ""}
          onAddNote={() => {}}
          onCitationClick={handleCitationClick}
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
