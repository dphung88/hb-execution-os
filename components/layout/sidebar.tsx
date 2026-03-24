"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BellRing,
  ChartColumnBig,
  ClipboardList,
  Eye,
  FileStack,
  LayoutDashboard,
  Megaphone,
  Mic
} from "lucide-react";

import { cn } from "@/lib/utils";

type SingleLink = {
  type: "single";
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type GroupLink = {
  type: "group";
  label: string;
  icon: ComponentType<{ className?: string }>;
  match: string;
  children: Array<{
    href: string;
    label: string;
  }>;
};

const links: Array<SingleLink | GroupLink> = [
  { type: "single", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    type: "group",
    label: "Sales Team",
    icon: ChartColumnBig,
    match: "/sales-performance",
    children: [
      { href: "/sales-performance", label: "Sales KPI" },
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
      { href: "/marketing-performance/results", label: "Marketing Results" },
      { href: "/marketing-performance/kpis", label: "Marketing KPIs" },
    ],
  },
  { type: "single", href: "/tasks", label: "Tasks", icon: ClipboardList },
  { type: "single", href: "/notifications", label: "Notifications", icon: BellRing },
  { type: "single", href: "/briefs", label: "CEO Brief", icon: FileStack },
  { type: "single", href: "/meetings", label: "Meetings", icon: Mic },
  { type: "single", href: "/preview", label: "Preview", icon: Eye }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur md:flex">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
          HB Execution OS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Executive Console
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Public operating view for leadership execution, task ownership, and CEO prep.
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          if (item.type === "group") {
            const activeGroup = pathname.startsWith(item.match);

            return (
              <div key={item.label} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                    activeGroup ? "bg-brand-50 text-brand-700" : "text-slate-700"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                <div className="ml-6 space-y-1 border-l border-slate-200 pl-4">
                  {item.children.map((child) => {
                    const activeChild = pathname === child.href || pathname.startsWith(`${child.href}/`);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
                          activeChild
                            ? "bg-brand-50 text-brand-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
