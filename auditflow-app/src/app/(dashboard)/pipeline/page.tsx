import type { ModuleSummary } from "@/types/common";

import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";

const pipelineStats: ModuleSummary[] = [
  { label: "Running Jobs", value: "4", hint: "Latest refresh just now", tone: "info" },
  { label: "Completed Today", value: "19", hint: "All delivery stages synced", tone: "success" },
  { label: "Queued Jobs", value: "7", hint: "Awaiting GPU workers", tone: "warning" },
  { label: "Failed Runs", value: "1", hint: "Retry available", tone: "danger" },
];

const stages = [
  { label: "Audio Transcode", tone: "success" as const },
  { label: "Normalization", tone: "success" as const },
  { label: "Visual Assets Fetch", tone: "info" as const },
  { label: "Video Rendering", tone: "neutral" as const },
  { label: "MP4 Muxing", tone: "neutral" as const },
];

const logs = [
  "[14:30:45] Task initialized: job-101",
  "[14:30:48] Source audio: M83_Midnight_City.wav",
  "[14:31:05] Transcoding to 320kbps MP3 completed.",
  "[14:31:15] LUFS analysis: -14.2 dB. Applying +0.2dB gain.",
  "[14:32:01] Fetching artist metadata and high-res cover art.",
  "[14:32:10] Rendering frame 450/12000...",
];

export default function PipelinePage() {
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
          <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-slate-700">Resume Paused</button>
          <button className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm">Create Task</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {pipelineStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-4 rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Task List</p>
              <h2 className="text-2xl font-semibold text-slate-900">Midnight City (M83) - Video Generation</h2>
            </div>
            <StatusBadge label="Running" tone="info" />
          </div>

          <div className="space-y-4 rounded-[24px] border border-[var(--color-border)] bg-slate-50 px-5 py-6">
            {stages.map((stage) => (
              <div key={stage.label} className="flex items-center gap-4">
                <span className="h-4 w-4 rounded-full border-2 border-current text-[var(--color-primary)]" />
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-800">{stage.label}</p>
                  <StatusBadge label={stage.tone === "success" ? "Done" : stage.tone === "info" ? "45%" : "Pending"} tone={stage.tone} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_250px]">
          <section className="rounded-[28px] bg-[#0d1117] p-6 text-sm text-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex items-center justify-between text-white">
              <h2 className="text-lg font-semibold">Live Execution Log</h2>
              <button className="text-sm text-slate-400">Clear Console</button>
            </div>
            <div className="space-y-3 font-mono">
              {logs.map((line, index) => (
                <p key={line} className={index === 2 ? "text-emerald-400" : "text-slate-300"}>
                  {line}
                </p>
              ))}
              <p className="text-indigo-400">• Streaming realtime console data...</p>
            </div>
          </section>

          <section className="space-y-4 rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h2 className="text-lg font-semibold text-slate-900">Deliverables</h2>
            <div className="space-y-3">
              {[
                "Master Audio",
                "Video Render (V1)",
                "Metadata JSON",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--color-border)] px-4 py-4">
                  <p className="font-semibold text-slate-900">{item}</p>
                  <p className="mt-1 text-sm text-slate-500">Ready for downstream access</p>
                </div>
              ))}
            </div>
            <button className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white">Open in Library</button>
            <button className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600">Stop Current Task</button>
          </section>
        </div>
      </div>
    </section>
  );
}
