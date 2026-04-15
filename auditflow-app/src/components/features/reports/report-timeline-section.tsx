"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import type { ReportTimelineSectionViewModel } from "@/types/library";

type ReportTimelineSectionProps = {
  section: ReportTimelineSectionViewModel;
  defaultVisibleCount?: number;
};

export function ReportTimelineSection({ section, defaultVisibleCount = 3 }: ReportTimelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    return isExpanded ? section.items : section.items.slice(0, defaultVisibleCount);
  }, [defaultVisibleCount, isExpanded, section.items]);

  if (section.items.length === 0) {
    return <EmptyState description={section.emptyDescription} title={section.emptyTitle} />;
  }

  const hiddenCount = Math.max(section.items.length - visibleItems.length, 0);

  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
        <span className="text-sm text-slate-400">{section.items.length} events</span>
      </div>

      <ol className="mt-4 space-y-4">
        {visibleItems.map((item) => (
          <li key={item.id} className="rounded-[20px] border border-[var(--color-border)] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.timestampLabel}</p>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 ? (
        <button
          className="mt-4 rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          {`Show ${hiddenCount} more timeline events`}
        </button>
      ) : null}
    </section>
  );
}
