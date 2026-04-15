"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";

export default function LibraryAssetError() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <ErrorState
        description="Something went wrong while loading this asset. Please try again or return to the library."
        title="Failed to load asset"
      />
      <Link
        className="text-sm font-medium text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        href="/library"
      >
        Back to Library
      </Link>
    </div>
  );
}
