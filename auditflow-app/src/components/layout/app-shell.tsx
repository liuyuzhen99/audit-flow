import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { StatusFooter } from "@/components/layout/status-footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-app-background)] px-4 py-6 text-[var(--color-foreground)] lg:px-5">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1440px] flex-col overflow-hidden rounded-[28px] border-4 border-slate-950/95 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <AppHeader />
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AppSidebar />
          <main className="min-w-0 border-l border-[var(--color-border)] bg-[var(--color-card)] px-6 py-8 lg:px-8">
            {children}
          </main>
        </div>
        <StatusFooter />
      </div>
    </div>
  );
}
