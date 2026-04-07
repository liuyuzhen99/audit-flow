import type { SidebarSection } from "@/types/common";

export const APP_NAME = "AuditFlow";

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Filters",
    items: ["All Artists", "Flagged Only", "Recent 2 Weeks"],
  },
  {
    title: "My Playlists",
    items: [
      "Trending Pop 2024",
      "Electronic Submissions",
      "Lo-Fi Beats Audit",
    ],
  },
];

export const FOOTER_LINKS = ["Documentation", "Support"];
