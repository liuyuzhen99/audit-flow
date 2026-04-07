import { FOOTER_LINKS } from "@/lib/constants";
import { getHealthStatusConfig } from "@/lib/status";

const backendStatus = getHealthStatusConfig("operational");
const auditStatus = getHealthStatusConfig("operational");

export function StatusFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-footer)] px-6 py-5 lg:px-8">
      <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-600">© 2024 AuditFlow Systems</span>
          {FOOTER_LINKS.map((item) => (
            <a key={item} className="hover:text-slate-800" href="#">
              {item}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
            <span>
              Backend: <strong className="font-medium text-slate-700">{backendStatus.label}</strong>
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
