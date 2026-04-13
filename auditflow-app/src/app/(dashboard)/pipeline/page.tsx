import { PipelineDashboardClient } from "@/components/features/pipeline/pipeline-dashboard-client";
import { adaptPipelineDashboard } from "@/lib/adapters/pipeline";
import { buildPipelineDashboardResponse } from "@/lib/mocks/sources/pipeline";

export default async function PipelinePage() {
  const dashboard = adaptPipelineDashboard(buildPipelineDashboardResponse({ tick: 2 }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950">Pipeline</h1>
          <p className="mt-3 text-lg text-slate-500">
            Monitor audio transforms, normalization, rendering, and output packaging from a single job console.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700">
            Resume Paused
          </button>
          <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Create Task
          </button>
        </div>
      </div>

      <PipelineDashboardClient initialDashboard={dashboard} />
    </section>
  );
}
