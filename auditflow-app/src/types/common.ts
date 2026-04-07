export type NavigationItem = {
  href: string;
  label: string;
};

export type SidebarSection = {
  title: string;
  items: string[];
};

export type HealthStatus = "operational" | "degraded" | "offline";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export type ModuleSummary = {
  label: string;
  value: string;
  hint?: string;
  tone?: Exclude<StatusTone, "neutral">;
};
