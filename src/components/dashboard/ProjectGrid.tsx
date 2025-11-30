import { ProjectCard, Project } from "./ProjectCard";
import { FadeIn } from "@/components/animations";

interface ProjectGridProps {
  projects: Project[];
  layout: "grid" | "list";
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectGrid({ projects, layout, onRename, onDelete }: ProjectGridProps) {
  if (layout === "list") {
    return (
      <div className="space-y-2">
        {projects.map((project, index) => (
          <FadeIn key={project.id} delay={index * 0.05} direction="up">
            <ProjectCard
              project={project}
              layout="list"
              onRename={onRename}
              onDelete={onDelete}
            />
          </FadeIn>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <FadeIn key={project.id} delay={index * 0.05} direction="up">
          <ProjectCard
            project={project}
            layout="grid"
            onRename={onRename}
            onDelete={onDelete}
          />
        </FadeIn>
      ))}
    </div>
  );
}
