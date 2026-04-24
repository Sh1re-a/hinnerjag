import { Bus, Home, MapPinned, Route } from "lucide-react";

export type NavItem = {
  id: "home" | "journey" | "live" | "stations";
  label: string;
  href: string;
  icon: typeof Home;
};

export const navItems: NavItem[] = [
  {
    id: "home",
    label: "Hem",
    href: "#home",
    icon: Home,
  },
  {
    id: "journey",
    label: "Resa",
    href: "#journey",
    icon: Route,
  },
  {
    id: "live",
    label: "Live avgångar",
    href: "#live",
    icon: Bus,
  },
  {
    id: "stations",
    label: "Stationer",
    href: "#stations",
    icon: MapPinned,
  },
];