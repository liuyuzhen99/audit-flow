"use client";

import Link from "next/link";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListQueryState } from "@/hooks/use-list-query-state";
import type { LibraryAssetCardViewModel } from "@/types/library";

type LibraryDashboardClientProps = {
  summary: {
    label: string;
    value: string;
    hint?: string;
    tone?: "info" | "success" | "warning" | "danger";
  }[];
  cards: LibraryAssetCardViewModel[];
};

const statusOptions = [
  { label: "All", value: undefined },
  { label: "Accepted", value: "accepted" },
] as const;

export function LibraryDashboardClient({ summary, cards }: LibraryDashboardClientProps) {
  const { createHrefForPatch, query, searchValue, resetFilters, setSearchValue } = useListQueryState();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <PageToolbar
        left={
          <SearchInput
            onValueChange={setSearchValue}
            placeholder="Search accepted assets or artists..."
            value={searchValue}
          />
        }
        right={
          <>
            {statusOptions.map((option) => {
              const isActive = (query.status ?? undefined) === option.value;

              return (
                <Link
                  className={isActive
                    ? "rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
                    : "rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700"
                  }
                  href={createHrefForPatch({ status: option.value })}
                  key={option.label}
                >
                  {option.label}
                </Link>
              );
            })}
            <button className="text-sm font-semibold text-[var(--color-primary)]" onClick={resetFilters} type="button">
              Reset Filters
            </button>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{asset.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{asset.artistName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge label={asset.statusLabel} tone={asset.statusTone} />
                  <StatusBadge label={asset.artifactStatusLabel} tone={asset.artifactStatusLabel === "Ready" ? "success" : "warning"} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Approved At</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{asset.approvedAtLabel}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Approved By</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{asset.approvedByLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {asset.artifactStatusLabel === "Ready" ? (
                  <Link
                    className="inline-flex items-center rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white"
                    href={`/library/${asset.id}`}
                  >
                    Open preview
                  </Link>
                ) : (
                  <Link
                    className="inline-flex items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
                    href={`/library/${asset.id}`}
                  >
                    View missing artifact
                  </Link>
                )}
                <a
                  className="inline-flex items-center rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  href={asset.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open source video
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
