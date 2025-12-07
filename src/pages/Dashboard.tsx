import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
import { SortDropdown, SortOption } from "@/components/dashboard/SortDropdown";
import { ProjectCard, Project } from "@/components/dashboard/ProjectCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectWithMeta extends Project {
  createdAt: Date;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch projects from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          created_at,
          updated_at,
          sources:sources(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const formattedProjects: ProjectWithMeta[] = (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          lastUpdated: formatRelativeTime(new Date(p.updated_at)),
          sourcesCount: p.sources?.[0]?.count || 0,
          createdAt: new Date(p.created_at),
        }));
        setProjects(formattedProjects);
      }
      setIsLoading(false);
    };

    fetchProjects();

    // Set up real-time subscription
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newProject = payload.new as any;
            setProjects((prev) => [
              {
                id: newProject.id,
                title: newProject.title,
                lastUpdated: formatRelativeTime(new Date(newProject.updated_at)),
                sourcesCount: 0,
                createdAt: new Date(newProject.created_at),
              },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setProjects((prev) =>
              prev.map((p) =>
                p.id === updated.id
                  ? {
                      ...p,
                      title: updated.title,
                      lastUpdated: formatRelativeTime(new Date(updated.updated_at)),
                    }
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as any;
            setProjects((prev) => prev.filter((p) => p.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

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

  const handleCreateProject = async () => {
    if (!user) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: "Untitled notebook",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create notebook",
        description: error.message,
        variant: "destructive",
      });
      setIsCreating(false);
    } else {
      toast({
        title: "Notebook created",
        description: "Your new notebook is ready.",
      });
      navigate(`/project/${data.id}`);
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) {
      console.error("Error renaming project:", error);
      toast({
        title: "Failed to rename",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Notebook renamed",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Notebook deleted",
      });
    }
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
