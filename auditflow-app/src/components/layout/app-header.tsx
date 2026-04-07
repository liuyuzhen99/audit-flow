"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Cog, Search, Waves } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { isActivePath, PRIMARY_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--color-border)] bg-white px-6 py-4 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <Link href="/artists" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[1.7rem] font-semibold tracking-tight text-[var(--color-primary)]">
                {APP_NAME}
              </div>
            </div>
          </Link>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[rgba(99,102,241,0.12)] text-slate-950"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-slate-500 shadow-sm">
            <Search className="h-4 w-4" />
            <input
              aria-label="Search"
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search..."
              type="search"
            />
          </label>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              aria-label="Notifications"
              className="rounded-full border border-transparent p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              type="button"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              aria-label="Settings"
              className="rounded-full border border-transparent p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              type="button"
            >
              <Cog className="h-5 w-5" />
            </button>
            <div className="h-10 w-px bg-[var(--color-border)]" />
            <div className="flex items-center gap-3 rounded-full pl-1 pr-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
                  RA
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--color-success)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
