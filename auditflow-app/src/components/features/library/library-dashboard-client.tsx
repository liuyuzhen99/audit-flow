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
  { label: "Published", value: "published" },
  { label: "Processing", value: "processing" },
  { label: "Needs Review", value: "review" },
] as const;

export function LibraryDashboardClient({ summary, cards }: LibraryDashboardClientProps) {
  const { query, searchValue, resetFilters, setSearchValue, setStatus } = useListQueryState();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {summary.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} tone={stat.tone} />
        ))}
      </div>

      <PageToolbar
        left={
          <SearchInput
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search assets, artists, or export packages..."
            value={searchValue}
          />
        }
        right={
          <>
            {statusOptions.map((option) => {
              const isActive = (query.status ?? undefined) === option.value;

              return (
                <button
                  className={isActive
                    ? "rounded-2xl bg-[rgba(99,102,241,0.12)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
                    : "rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-slate-700"
                  }
                  key={option.label}
                  onClick={() => setStatus(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
            <button className="text-sm font-semibold text-[var(--color-primary)]" onClick={resetFilters} type="button">
              Reset Filters
            </button>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((asset) => (
          <Link
            key={asset.id}
            href={`/library/${asset.id}`}
            className="group overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <div className={`flex aspect-video items-end bg-gradient-to-br ${asset.gradientClassName} p-4 text-right text-white`}>
              <div className="ml-auto rounded-lg bg-black/55 px-3 py-1 text-xs font-semibold">
                {asset.resolutionLabel} · {asset.durationLabel}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{asset.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{asset.artistName}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <StatusBadge label={asset.statusLabel} tone={asset.statusTone} />
                <span className="text-sm text-slate-500">{asset.dateLabel}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}
