import { FOOTER_LINKS } from "@/lib/constants";
import { getBackendBaseUrl } from "@/app/api/backend";
import { getHealthStatusConfig } from "@/lib/status";
import type { HealthStatus } from "@/types/common";

const auditStatus = getHealthStatusConfig("operational");

type BackendStatusResult = {
  status: HealthStatus;
  detail?: string;
};

export async function StatusFooter() {
  const backendReadiness = await getBackendStatus();
  const backendStatus = getHealthStatusConfig(backendReadiness.status);

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-footer)] px-6 py-5 lg:px-8">
      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-600">© 2026 TransFlow System</span>
          {FOOTER_LINKS.map((item) => (
            <a key={item} className="hover:text-slate-800" href="#">
              {item}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
            <span title={backendReadiness.detail}>
              Backend: <strong className="font-medium text-slate-700">{backendStatus.label}</strong>
              {backendReadiness.detail ? (
                <span className="ml-1 text-xs text-slate-400">({backendReadiness.detail})</span>
              ) : null}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
            <span>
              AI Audit: <strong className="font-medium text-slate-700">{auditStatus.label}</strong>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

async function getBackendStatus(): Promise<BackendStatusResult> {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/readyz`, {
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    const reportedStatus = typeof payload?.status === "string" ? payload.status : undefined;
    const degradedChecks =
      payload?.checks && typeof payload.checks === "object"
        ? Object.entries(payload.checks)
            .filter(([, value]) => {
              if (typeof value !== "object" || value === null || !("status" in value)) {
                return false;
              }
              if (value.status !== "ok" && value.status !== "skipped") {
                return true;
              }
              return reportedStatus === "degraded" && value.status === "skipped";
            })
            .map(([key, value]) => `${key} ${typeof value === "object" && value !== null && "status" in value ? value.status : "degraded"}`)
        : [];

    if (response.ok && reportedStatus !== "degraded") {
      return { status: "operational" };
    }
    return {
      status: "degraded",
      detail: degradedChecks.length ? degradedChecks.join(", ") : "readiness check degraded",
    };
  } catch {
    return { status: "offline", detail: "readyz unavailable" };
  }
}
