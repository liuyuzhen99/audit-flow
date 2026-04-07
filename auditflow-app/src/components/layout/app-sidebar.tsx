import { LogOut } from "lucide-react";

import { SIDEBAR_SECTIONS } from "@/lib/constants";

export function AppSidebar() {
  return (
    <aside className="flex h-full flex-col justify-between bg-[var(--color-sidebar)]">
      <div className="space-y-10 px-8 py-8">
        {SIDEBAR_SECTIONS.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {section.title}
            </h2>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item}>
                  <button
                    className="w-full rounded-xl px-3 py-2 text-left text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-[var(--color-border)] px-6 py-7">
        <button
          className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-left text-base font-medium text-red-500 transition-colors hover:bg-red-50"
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
