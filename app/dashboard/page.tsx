"use client";

import Dashboard from "@/pages/Dashboard";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
