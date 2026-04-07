import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageToolbarProps = {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function PageToolbar({ left, right, className }: PageToolbarProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{left}</div>
      {right ? <div className="flex flex-wrap items-center gap-3">{right}</div> : null}
    </section>
  );
}
