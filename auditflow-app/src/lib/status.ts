import type { HealthStatus, StatusTone } from "@/types/common";

export type StatusConfig = {
  label: string;
  tone: StatusTone;
};

export function getHealthStatusConfig(status: HealthStatus): StatusConfig {
  switch (status) {
    case "operational":
      return { label: "Operational", tone: "success" };
    case "degraded":
      return { label: "Degraded", tone: "warning" };
    case "offline":
      return { label: "Offline", tone: "danger" };
    default:
      return { label: "Unknown", tone: "neutral" };
  }
}
