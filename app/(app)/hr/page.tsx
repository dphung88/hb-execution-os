import Link from "next/link";
import { getPeriods } from "@/lib/config/periods";
import { ArrowRight, Users, Briefcase, TrendingDown, GraduationCap, Clock, UserCheck } from "lucide-react";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function HrDashboard({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const kpiCards = [
    { label: "Total Headcount",       value: "—", sub: "across all departments",    icon: Users,        accent: false },
    { label: "Open Positions",         value: "—", sub: "actively recruiting",       icon: Briefcase,    accent: true  },
    { label: "Attrition Rate",         value: "—", sub: "trailing 3 months",         icon: TrendingDown, accent: false },
    { label: "Avg Tenure",             value: "—", sub: "years per employee",        icon: Clock,        accent: false },
    { label: "Training Completion",    value: "—", sub: "Q1 compliance modules",     icon: GraduationCap,accent: false },
    { label: "New Hires MTD",          value: "—", sub: "onboarded this period",     icon: UserCheck,    accent: false },
  ];

  const quickLinks = [
    { label: "Headcount Detail", href: `/hr/headcount?period=${selectedPeriod}` },
    { label: "HR Tasks",         href: `/hr/tasks?period=${selectedPeriod}` },
    { label: "HR Results",       href: `/hr/results?period=${selectedPeriod}` },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">HR Dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Headcount, recruitment, and<br className="hidden sm:block" /> people metrics in one place.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <form method="get" className="flex items-center gap-2">
              <select
                name="period"
                defaultValue={selectedPeriod}
                className="h-11 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300"
              >
                {periods.map((p) => (
                  <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>
                ))}
              </select>
              <button type="submit" className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                Apply
              </button>
            </form>
            <Link
              href={`/hr/headcount?period=${selectedPeriod}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Headcount Detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
          <span className="text-slate-400">Period: </span>
          <span className="font-semibold text-white">{periodLabel}</span>
          <span className="mx-3 text-slate-500">·</span>
          <span className="text-xs italic text-slate-400">HR data integration pending</span>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {kpiCards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <div className={`rounded-xl p-2 ${accent ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-500"}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className={`mt-4 text-3xl font-semibold leading-none ${accent ? "text-sky-600" : "text-slate-900"}`}>
              {value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </section>

      {/* Quick Nav */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">HR Modules</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              {label}
              <ArrowRight className="h-4 w-4 opacity-40" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
