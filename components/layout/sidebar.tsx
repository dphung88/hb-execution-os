"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  ClipboardList,
  Eye,
  FileStack,
  LayoutDashboard,
  Mic
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/notifications", label: "Notifications", icon: BellRing },
  { href: "/briefs", label: "CEO Brief", icon: FileStack },
  { href: "/meetings", label: "Meetings", icon: Mic },
  { href: "/preview", label: "Preview", icon: Eye }
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
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
