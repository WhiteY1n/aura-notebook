import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { TopNav } from "@/features/dashboard/TopNav";
import { SearchBar } from "@/features/dashboard/SearchBar";
import { LayoutToggle } from "@/features/dashboard/LayoutToggle";
import { SortDropdown, SortOption } from "@/features/dashboard/SortDropdown";
import { ProjectCard, Project } from "@/features/dashboard/ProjectCard";
import { EmptyState } from "@/features/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useNotebookDelete } from "@/hooks/useNotebookDelete";
import { useNotebookUpdate } from "@/hooks/useNotebookUpdate";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectWithMeta extends Project {
  createdAt: Date;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notebooks, isLoading, createNotebook, isCreating } = useNotebooks();
  const { deleteNotebook } = useNotebookDelete();
  const { updateNotebook } = useNotebookUpdate();
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("date");

  // Transform notebooks to projects format
  const projects = useMemo(() => {
    return (notebooks || []).map((nb) => ({
      id: nb.id,
      title: nb.title,
      icon: nb.icon || '📝',
      lastUpdated: formatRelativeTime(new Date(nb.updated_at)),
      sourcesCount: nb.sources?.[0]?.count || 0,
      createdAt: new Date(nb.created_at),
    }));
  }, [notebooks]);

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOption === "date") {
      result = [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [projects, searchQuery, sortOption]);

  const handleCreateProject = () => {
    createNotebook(
      {
        title: "Untitled notebook",
        description: "",
      },
      {
        onSuccess: async (newNotebook) => {
          console.log('Notebook created:', newNotebook.id);
          // Wait a bit for the query to refetch
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Navigating to notebook:', newNotebook.id);
          navigate(`/project/${newNotebook.id}`);
        },
        onError: (error: any) => {
          console.error('Failed to create notebook:', error);
          toast({
            title: "Failed to create notebook",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await updateNotebook({
        id: id,
        updates: { title: newTitle },
      });
      
      toast({
        title: "Notebook renamed",
      });
    } catch (error: any) {
      console.error("Error renaming notebook:", error);
      toast({
        title: "Failed to rename",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for notebook:', id);
    deleteNotebook(id);
  };

  const isEmpty = !isLoading && projects.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-10 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        ) : isEmpty ? (
          <EmptyState onCreateProject={handleCreateProject} />
        ) : (
          <div className="space-y-6">
            {/* Search + Sort + Layout toggle row */}
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="flex-1 min-w-0"
                  />
                  <SortDropdown value={sortOption} onValueChange={setSortOption} />
                </div>
                <LayoutToggle layout={layout} onLayoutChange={setLayout} />
              </div>
            </FadeIn>

            {/* Create button */}
            <FadeIn delay={0.1}>
              <Button onClick={handleCreateProject} className="gap-2" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create new
              </Button>
            </FadeIn>

            {/* Projects Grid/List */}
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No notebooks found matching "{searchQuery}"
                </p>
              </div>
            ) : layout === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedProjects.map((project, index) => (
                  <FadeIn key={project.id} delay={index * 0.05}>
                    <ProjectCard
                      project={project}
                      layout="grid"
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedProjects.map((project, index) => (
                  <FadeIn key={project.id} delay={index * 0.03}>
                    <ProjectCard
                      project={project}
                      layout="list"
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}
