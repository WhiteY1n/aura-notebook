"use client";

import ProjectView from "@/pages/ProjectView";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProjectPage() {
  return (
    <ProtectedRoute>
      <ProjectView />
    </ProtectedRoute>
  );
}
