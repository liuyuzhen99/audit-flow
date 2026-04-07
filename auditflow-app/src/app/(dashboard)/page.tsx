import Link from "next/link";

import { PRIMARY_NAV_ITEMS } from "@/lib/nav";

export default function DashboardIndexPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Dashboard Foundation
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          AuditFlow workspace is ready.
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-500">
          Phase 1 establishes the shared shell, design tokens, navigation, and
          route skeletons for the operational modules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[24px] border border-[var(--color-border)] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.label}</h2>
            <p className="mt-2 text-sm text-slate-500">Open module foundation</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
