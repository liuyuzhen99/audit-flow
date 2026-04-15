import Link from "next/link";

import { QueueDashboardClient } from "@/components/features/queue/queue-dashboard-client";
import { adaptQueueDashboard } from "@/lib/adapters/queue";
import { buildQueueDashboardResponse } from "@/lib/mocks/sources/queue";
import { readListQuery } from "@/lib/query/list-query";

type QueuePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(rawSearchParams: Record<string, string | string[] | undefined> | undefined) {
  const searchParams = new URLSearchParams();

  if (!rawSearchParams) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export default async function QueuePage({ searchParams }: QueuePageProps = {}) {
  const resolvedSearchParams = normalizeSearchParams(searchParams ? await searchParams : undefined);
  const query = readListQuery(resolvedSearchParams);
  const dashboard = adaptQueueDashboard(buildQueueDashboardResponse({ ...query, tick: 2 }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Audit Queue</h1>
          <p className="mt-3 text-lg text-slate-500">
            Track download progress, AI audit status, and manual review routing in one operational view.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Export Report — Phase-5-gated; no report route exists yet */}
          <button
            className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed"
            disabled
            title="Export Report coming in Phase 5"
          >
            Export Report (Phase 5)
          </button>
          <Link
            className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            href="/pipeline"
          >
            Route to Pipeline
          </Link>
        </div>
      </div>

      <QueueDashboardClient initialDashboard={dashboard} />
    </section>
  );
}
