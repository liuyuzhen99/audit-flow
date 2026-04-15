import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LibraryAssetDetailClient } from "@/components/features/library/library-asset-detail-client";
import { adaptLibraryAssetDetail } from "@/lib/adapters/library";
import { getLibraryAssetDetail, getOrderedLibraryAssetIds } from "@/lib/mocks/sources/library";

type LibraryAssetPageProps = {
  params: Promise<{ assetId: string }>;
};

export default async function LibraryAssetPage({ params }: LibraryAssetPageProps) {
  const { assetId } = await params;
  const asset = getLibraryAssetDetail(assetId);

  if (!asset) {
    notFound();
  }

  // Compute prev/next for in-page navigation without returning to the grid
  const orderedIds = getOrderedLibraryAssetIds();
  const currentIndex = orderedIds.indexOf(assetId);
  const prevId = currentIndex > 0 ? (orderedIds[currentIndex - 1] ?? null) : null;
  const nextId = currentIndex < orderedIds.length - 1 ? (orderedIds[currentIndex + 1] ?? null) : null;

  const viewModel = adaptLibraryAssetDetail(asset, currentIndex);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          href="/library"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
      </div>

      <LibraryAssetDetailClient nextId={nextId} prevId={prevId} viewModel={viewModel} />
    </section>
  );
}
