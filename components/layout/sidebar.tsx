"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { appNavLinks } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  // Default: only expand the currently active group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of appNavLinks) {
      if (item.type === "group") {
        init[item.label] = pathname.startsWith(item.match);
      }
    }
    return init;
  });

  function toggle(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur md:flex">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600">
          HB Execution OS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Executive Console
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Public operating view for leadership execution, task ownership, and CEO prep.
        </p>
      </div>

      <nav className="space-y-1 overflow-y-auto">
        {appNavLinks.map((item) => {
          if (item.type === "group") {
            const activeGroup = pathname.startsWith(item.match);
            const isOpen = openGroups[item.label] ?? false;

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggle(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-50",
                    activeGroup ? "text-brand-700" : "text-slate-700"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-6 mb-1 space-y-0.5 border-l border-slate-200 pl-4">
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
                )}
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
