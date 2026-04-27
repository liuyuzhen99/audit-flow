import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LibraryAssetDetailClient } from "@/components/features/library/library-asset-detail-client";
import { adaptLibraryAssetDetail } from "@/lib/adapters/library";
import { getLibraryAssetDetail } from "@/lib/api/library";
import { getRequestOrigin } from "@/lib/server/request-origin";

type LibraryAssetPageProps = {
  params: Promise<{ assetId: string }>;
};

export default async function LibraryAssetPage({ params }: LibraryAssetPageProps) {
  const { assetId } = await params;
  const decodedAssetId = decodeURIComponent(assetId);
  const requestOrigin = await getRequestOrigin();
  const detail = adaptLibraryAssetDetail(await getLibraryAssetDetail({ assetId: decodedAssetId, baseUrl: requestOrigin }));

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

      <LibraryAssetDetailClient detail={detail} />
    </section>
  );
}
