"use client";

import Link from "next/link";

type LibraryAssetDetailClientProps = {
  assetId: string;
};

export function LibraryAssetDetailClient({ assetId }: LibraryAssetDetailClientProps) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-8 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <h1 className="text-3xl font-semibold text-slate-950">Library Detail Deferred</h1>
      <p className="mt-4 max-w-2xl text-slate-500">
        Asset <span className="font-medium text-slate-700">{assetId}</span> is part of the real Phase 4 library list,
        but the rich media/detail surface remains outside this integration pass. For now, validate the accepted asset in
        the list view and use the source link or audit log for smoke-test verification.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
          href="/library"
        >
          Back to Library
        </Link>
        <a
          className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700"
          href={`/api/audit-log?aggregateType=candidate&aggregateId=${assetId}`}
          rel="noreferrer"
          target="_blank"
        >
          Open Audit Log
        </a>
      </div>
    </div>
  );
}

