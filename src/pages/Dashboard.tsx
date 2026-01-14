"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProjectWithMeta extends Project {
  createdAt: Date;
}

const ITEMS_PER_PAGE = 12;

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { notebooks, isLoading, createNotebook, isCreating } = useNotebooks();
  const { deleteNotebook } = useNotebookDelete();
  const { updateNotebook } = useNotebookUpdate();
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [currentPage, setCurrentPage] = useState(1);

  useDocumentTitle("Aura Notebook | Dashboard");

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption]);

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
          router.push(`/project/${newNotebook.id}`);
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
              <Button onClick={handleCreateProject} className="gap-2 select-none" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 " />
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
            ) : (
              <>
                {layout === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedProjects.map((project, index) => (
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
                    {paginatedProjects.map((project, index) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <FadeIn delay={0.2}>
                    <Pagination className="mt-8 select-none">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                          const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                          if (showEllipsisBefore || showEllipsisAfter) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </FadeIn>
                )}
              </>
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
