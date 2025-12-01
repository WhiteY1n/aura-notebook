import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
import { SortDropdown, SortOption } from "@/components/dashboard/SortDropdown";
import { ProjectCard, Project } from "@/components/dashboard/ProjectCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations";

// Mock data with createdAt for sorting
const mockProjects: (Project & { createdAt: Date })[] = [
  { id: "1", title: "Introduction to Machine Learning", lastUpdated: "2 hours ago", sourcesCount: 5, createdAt: new Date("2024-01-15") },
  { id: "2", title: "React Best Practices", lastUpdated: "Yesterday", sourcesCount: 3, createdAt: new Date("2024-01-10") },
  { id: "3", title: "Quantum Computing Lecture Notes", lastUpdated: "3 days ago", sourcesCount: 8, createdAt: new Date("2024-01-12") },
  { id: "4", title: "Data Structures and Algorithms", lastUpdated: "1 week ago", sourcesCount: 12, createdAt: new Date("2024-01-05") },
  { id: "5", title: "Neural Networks Deep Dive", lastUpdated: "2 weeks ago", sourcesCount: 6, createdAt: new Date("2024-01-08") },
  { id: "6", title: "Research Paper: AI Ethics", lastUpdated: "1 month ago", sourcesCount: 4, createdAt: new Date("2023-12-20") },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<(Project & { createdAt: Date })[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  const filteredAndSortedProjects = useMemo(() => {
    // Filter first
    let result = projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort
    if (sortOption === "date") {
      result = [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [projects, searchQuery, sortOption]);

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      const newProject: Project & { createdAt: Date } = {
        id: Date.now().toString(),
        title: newProjectTitle.trim(),
        lastUpdated: "Just now",
        sourcesCount: 0,
        createdAt: new Date(),
      };
      setProjects([newProject, ...projects]);
      setNewProjectTitle("");
      setCreateDialogOpen(false);
      navigate(`/project/${newProject.id}`);
    }
  };

  const handleRename = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p))
    );
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const isEmpty = projects.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <EmptyState onCreateProject={() => setCreateDialogOpen(true)} />
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
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
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

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new notebook</DialogTitle>
            <DialogDescription>
              Give your notebook a name to get started.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="e.g., Biology 101, Project Research..."
            onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectTitle.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
