import type { NavigationItem } from "@/types/common";

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { href: "/artists", label: "Artists" },
  { href: "/queue", label: "Audit Queue" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/library", label: "Library" },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
