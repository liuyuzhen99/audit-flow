"use client";

import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";

export default function ReportDetailError() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <ErrorState
        description="Something went wrong while loading this report. Please try again or return to the queue."
        title="Failed to load report"
      />
      <Link
        className="text-sm font-medium text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        href="/queue"
      >
        Back to Queue
      </Link>
    </div>
  );
}
