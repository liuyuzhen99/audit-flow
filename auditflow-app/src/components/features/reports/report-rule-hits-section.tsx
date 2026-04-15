"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ReportRuleHitsSectionViewModel } from "@/types/library";

type ReportRuleHitsSectionProps = {
  section: ReportRuleHitsSectionViewModel;
  defaultVisibleCount?: number;
  isLoading?: boolean;
};

export function ReportRuleHitsSection({
  section,
  defaultVisibleCount = 3,
  isLoading = false,
}: ReportRuleHitsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    return isExpanded ? section.items : section.items.slice(0, defaultVisibleCount);
  }, [defaultVisibleCount, isExpanded, section.items]);

  if (isLoading) {
    return <LoadingState description="Preparing the latest rule-hit analysis." title="Loading rule hits" />;
  }

  if (section.items.length === 0) {
    return <EmptyState description={section.emptyDescription} title={section.emptyTitle} />;
  }

  const hiddenCount = Math.max(section.items.length - visibleItems.length, 0);

  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
        <span className="text-sm text-slate-400">{section.items.length} total</span>
      </div>

      <div className="mt-4 space-y-3">
        {visibleItems.map((item) => (
          <article key={item.id} className="rounded-[20px] border border-[var(--color-border)] bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <StatusBadge label={item.badgeLabel} tone={item.badgeTone} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>

      {hiddenCount > 0 ? (
        <button
          className="mt-4 rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          {`Show ${hiddenCount} more rule hits`}
        </button>
      ) : null}
    </section>
  );
}
