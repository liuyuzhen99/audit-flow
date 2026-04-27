"use client";

import Link from "next/link";
import { Download, ExternalLink, RefreshCw } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import type { LibraryAssetDetailViewModel } from "@/types/library";

type LibraryAssetDetailClientProps = {
  detail: LibraryAssetDetailViewModel;
};

export function LibraryAssetDetailClient({ detail }: LibraryAssetDetailClientProps) {
  const isReady = detail.artifactStatus === "ready" && Boolean(detail.previewUrl);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-slate-950">
          {isReady ? (
            <video
              className="aspect-video w-full bg-black"
              controls
              key={detail.previewUrl}
              preload="metadata"
              src={detail.previewUrl ?? undefined}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center">
              <StatusBadge label={detail.artifactStatusLabel} tone={detail.artifactStatus === "missing" ? "warning" : "neutral"} />
              <h1 className="text-2xl font-semibold text-white">{detail.title}</h1>
              <p className="max-w-md text-sm text-slate-300">
                {detail.artifactStatus === "missing"
                  ? "Final media has not been produced for this accepted asset yet."
                  : "The stored artifact is no longer available through its current lifecycle state."}
              </p>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{detail.artistName}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">{detail.title}</h1>
            </div>
            <StatusBadge label={detail.artifactStatusLabel} tone={detail.artifactStatus === "ready" ? "success" : "warning"} />
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Approved</dt>
              <dd className="text-right font-medium text-slate-800">{detail.approvedAtLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Reviewer</dt>
              <dd className="text-right font-medium text-slate-800">{detail.approvedByLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Primary artifact</dt>
              <dd className="text-right font-medium text-slate-800">{detail.primaryArtifactLabel}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {detail.fallbackDownloadUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white"
                href={detail.fallbackDownloadUrl}
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            ) : null}
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-slate-700"
              href={`/api/library/${detail.id}`}
              target="_blank"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-slate-700"
              href={detail.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Source
            </a>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Artifacts</h2>
        <div className="mt-4 divide-y divide-[var(--color-border)]">
          {detail.artifacts.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No artifact records are attached to this asset.</p>
          ) : (
            detail.artifacts.map((artifact) => (
              <div className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_120px_160px]" key={artifact.artifactId}>
                <span className="font-medium text-slate-800">{artifact.artifactType}</span>
                <span className="text-slate-500">{artifact.lifecycleStatus}</span>
                <span className="text-slate-500">{Math.ceil(artifact.sizeBytes / 1024)} KB</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
