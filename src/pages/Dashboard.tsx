import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
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

// Mock data
const mockProjects: Project[] = [
  { id: "1", title: "Introduction to Machine Learning", lastUpdated: "2 hours ago", sourcesCount: 5 },
  { id: "2", title: "React Best Practices", lastUpdated: "Yesterday", sourcesCount: 3 },
  { id: "3", title: "Quantum Computing Lecture Notes", lastUpdated: "3 days ago", sourcesCount: 8 },
  { id: "4", title: "Data Structures and Algorithms", lastUpdated: "1 week ago", sourcesCount: 12 },
  { id: "5", title: "Neural Networks Deep Dive", lastUpdated: "2 weeks ago", sourcesCount: 6 },
  { id: "6", title: "Research Paper: AI Ethics", lastUpdated: "1 month ago", sourcesCount: 4 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        title: newProjectTitle.trim(),
        lastUpdated: "Just now",
        sourcesCount: 0,
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
            {/* Search Bar - Full width */}
            <FadeIn>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full"
              />
            </FadeIn>

            {/* Create button + Layout toggle */}
            <FadeIn delay={0.1} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create new
              </Button>
              <LayoutToggle layout={layout} onLayoutChange={setLayout} />
            </FadeIn>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No notebooks found matching "{searchQuery}"
                </p>
              </div>
            ) : layout === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProjects.map((project, index) => (
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
                {filteredProjects.map((project, index) => (
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