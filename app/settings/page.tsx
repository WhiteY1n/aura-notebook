"use client";

import Settings from "@/pages/Settings";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
