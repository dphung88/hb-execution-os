"use client";

import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  ChartColumnBig,
  ClipboardList,
  Eye,
  FileStack,
  LayoutDashboard,
  Megaphone,
  Mic,
  Settings2,
  Landmark,
  Users,
  Stethoscope,
  Monitor,
} from "lucide-react";

export type SingleNavLink = {
  type: "single";
  href: string;
  label: string;
  icon: LucideIcon;
};

export type GroupNavLink = {
  type: "group";
  label: string;
  icon: LucideIcon;
  match: string;
  children: Array<{
    href: string;
    label: string;
  }>;
};

export type NavLinkItem = SingleNavLink | GroupNavLink;

export const appNavLinks: NavLinkItem[] = [
  { type: "single", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group",
    label: "Sales Team",
    icon: ChartColumnBig,
    match: "/sales-performance",
    children: [
      { href: "/sales-performance", label: "Sales Dashboard" },
      { href: "/sales-performance/volume", label: "Sales Volume" },
      { href: "/sales-performance/forecast", label: "Sales Forecast" },
      { href: "/sales-performance/sku-forecast", label: "SKU Forecast" },
      { href: "/sales-performance/targets", label: "Sales Targets" },
    ],
  },
  {
    type: "group",
    label: "Marketing Team",
    icon: Megaphone,
    match: "/marketing-performance",
    children: [
      { href: "/marketing-performance", label: "Marketing Dashboard" },
      { href: "/marketing-performance/tasks", label: "Marketing Tasks" },
      { href: "/marketing-performance/targets", label: "Marketing Targets" },
      { href: "/marketing-performance/results", label: "Marketing Results" },
    ],
  },
  {
    type: "group",
    label: "Finance Team",
    icon: Landmark,
    match: "/finance",
    children: [
      { href: "/finance", label: "Finance Dashboard" },
      { href: "/finance/break-even", label: "Break-Even Analysis" },
      { href: "/finance/tasks", label: "Finance Tasks" },
      { href: "/finance/results", label: "Finance Results" },
    ],
  },
  {
    type: "group",
    label: "HR Team",
    icon: Users,
    match: "/hr",
    children: [
      { href: "/hr", label: "HR Dashboard" },
      { href: "/hr/headcount", label: "Headcount Detail" },
      { href: "/hr/tasks", label: "HR Tasks" },
      { href: "/hr/results", label: "HR Results" },
    ],
  },
  {
    type: "group",
    label: "Medical Team",
    icon: Stethoscope,
    match: "/medical",
    children: [
      { href: "/medical", label: "Medical Dashboard" },
      { href: "/medical/registrations", label: "Registrations" },
      { href: "/medical/tasks", label: "Medical Tasks" },
      { href: "/medical/results", label: "Medical Results" },
    ],
  },
  {
    type: "group",
    label: "IT Team",
    icon: Monitor,
    match: "/it",
    children: [
      { href: "/it", label: "IT Dashboard" },
      { href: "/it/system-status", label: "System Status" },
      { href: "/it/tasks", label: "IT Tasks" },
      { href: "/it/results", label: "IT Results" },
    ],
  },
  { type: "single", href: "/tasks", label: "Tasks", icon: ClipboardList },
  { type: "single", href: "/notifications", label: "Notifications", icon: BellRing },
  { type: "single", href: "/briefs", label: "CEO Brief", icon: FileStack },
  { type: "single", href: "/meetings", label: "Meetings", icon: Mic },
  { type: "single", href: "/preview", label: "Preview", icon: Eye },
  {
    type: "group",
    label: "Settings",
    icon: Settings2,
    match: "/settings",
    children: [
      { href: "/settings", label: "App Settings" },
      { href: "/settings/periods", label: "Period Management" },
      { href: "/settings/skus", label: "SKU Lot Dates" },
    ],
  },
];
