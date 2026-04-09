import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function LoadingState({ title, description, className }: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      className={cn(
        "rounded-[24px] border border-[var(--color-border)] bg-white px-6 py-8 shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-primary)]" />
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {description ? <p className="mt-3 text-sm text-slate-500">{description}</p> : null}
    </section>
  );
}

type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-[24px] border border-rose-200 bg-rose-50 px-6 py-8 shadow-[0_10px_24px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-rose-700">{title}</h2>
      <p className="mt-3 text-sm text-rose-600">{description}</p>
      {retryLabel ? (
        <button
          className="mt-5 rounded-2xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
          onClick={onRetry}
          type="button"
        >
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-dashed border-[var(--color-border)] bg-slate-50 px-6 py-8 text-center",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

type SectionSkeletonProps = {
  sections?: number;
  className?: string;
};

export function SectionSkeleton({ sections = 2, className }: SectionSkeletonProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: sections }).map((_, index) => (
        <div
          key={`section-skeleton-${index}`}
          className="h-24 animate-pulse rounded-[24px] border border-[var(--color-border)] bg-slate-100"
          data-testid="section-skeleton-block"
        />
      ))}
    </div>
  );
}
