"use client";

import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { appNavLinks } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
    <div className="md:hidden">
      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open navigation menu"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Menu
      </Button>

      {open && (
        <div className="mt-4 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-panel backdrop-blur">
          <nav className="space-y-1">
            {appNavLinks.map((item) => {
              if (item.type === "group") {
                const activeGroup = pathname.startsWith(item.match);
                const isOpen = openGroups[item.label] ?? false;

                return (
                  <div key={item.label} className="rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => toggle(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        activeGroup ? "text-brand-700" : "text-slate-800"
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
                      <div className="space-y-1 border-t border-slate-100 px-3 pb-3 pt-2 pl-5">
                        {item.children.map((child) => {
                          const activeChild = pathname === child.href || pathname.startsWith(`${child.href}/`);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex rounded-xl px-3 py-2 text-sm font-medium transition",
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
