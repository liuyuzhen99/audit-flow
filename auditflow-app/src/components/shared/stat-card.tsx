import type { ModuleSummary } from "@/types/common";

import { cn } from "@/lib/utils";

const hintToneClasses = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
  info: "text-indigo-600",
};

type StatCardProps = ModuleSummary;

export function StatCard({ label, value, hint, tone = "info" }: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-[var(--color-border)] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      {hint ? (
        <p className={cn("mt-3 text-sm font-medium", hintToneClasses[tone])}>{hint}</p>
      ) : null}
    </article>
  );
}
