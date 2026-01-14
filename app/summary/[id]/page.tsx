"use client";

import Summary from "@/pages/Summary";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SummaryPage() {
  return (
    <ProtectedRoute>
      <Summary />
    </ProtectedRoute>
  );
}
