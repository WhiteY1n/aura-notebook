"use client";

import ProjectView from "@/pages/ProjectView";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

export default function ProjectPage() {
  return (
    <ProtectedRoute>
      <ProjectView />
    </ProtectedRoute>
  );
}
