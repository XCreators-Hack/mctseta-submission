export interface NavItem {
  href: string;
  label: string;
  subtitle: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", subtitle: "Live telemetry" },
  { href: "/zones", label: "Crossing Zones", subtitle: "Wildlife crossing configuration" },
  { href: "/device", label: "Devices", subtitle: "Hardware and connection details" },
  { href: "/fleet", label: "Fleet / Logistics", subtitle: "Driver route awareness" },
  { href: "/operations", label: "Operations", subtitle: "Reserve ranger view" },
  { href: "/system", label: "System", subtitle: "API and frontend status" },
];
