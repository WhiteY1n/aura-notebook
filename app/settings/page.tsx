"use client";

import Settings from "@/pages/Settings";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
