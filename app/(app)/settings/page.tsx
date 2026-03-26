import Link from "next/link";
import { Calendar, Settings2 } from "lucide-react";

export default function SettingsPage() {
  const items = [
    {
      href: "/settings/periods",
      icon: Calendar,
      title: "Period Management",
      description: "Define tracking periods with custom start and end dates. Used across all Sales and Marketing filters.",
      color: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">Configuration</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
          App Settings
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Manage system-level configuration that applies across the entire platform — periods, KPI rules, and business parameters.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel transition hover:border-sky-200 hover:shadow-lg"
          >
            <div className={`inline-flex rounded-2xl p-3 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900 group-hover:text-sky-700">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
