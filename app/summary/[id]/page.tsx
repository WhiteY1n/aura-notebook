"use client";

import Summary from "@/pages/Summary";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

export default function SummaryPage() {
  return (
    <ProtectedRoute>
      <Summary />
    </ProtectedRoute>
  );
}
