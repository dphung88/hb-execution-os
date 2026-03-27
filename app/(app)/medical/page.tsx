import Link from "next/link";
import { getPeriods } from "@/lib/config/periods";
import { ArrowRight, FlaskConical, ShieldCheck, FileText, AlertTriangle, ClipboardList, CheckCircle } from "lucide-react";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function MedicalDashboard({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const kpiCards = [
    { label: "Active Registrations",    value: "—", sub: "products with valid license",     icon: FileText,      accent: false },
    { label: "Pending Submissions",     value: "—", sub: "awaiting authority review",        icon: ClipboardList, accent: true  },
    { label: "Expiring < 90 Days",      value: "—", sub: "registrations to renew",           icon: AlertTriangle, accent: false },
    { label: "Quality Incidents",       value: "—", sub: "open NCRs this period",            icon: ShieldCheck,   accent: false },
    { label: "Clinical Trials Active",  value: "—", sub: "studies in progress",              icon: FlaskConical,  accent: false },
    { label: "Compliance Rate",         value: "—", sub: "regulatory requirements met",      icon: CheckCircle,   accent: false },
  ];

  const quickLinks = [
    { label: "Product Registrations", href: `/medical/registrations?period=${selectedPeriod}` },
    { label: "Medical Tasks",          href: `/medical/tasks?period=${selectedPeriod}` },
    { label: "Medical Results",        href: `/medical/results?period=${selectedPeriod}` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Medical Dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Regulatory, clinical, and<br className="hidden sm:block" /> quality metrics in one place.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <form method="get" className="flex items-center gap-2">
              <select name="period" defaultValue={selectedPeriod}
                className="h-11 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300">
                {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
              </select>
              <button type="submit" className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Apply</button>
            </form>
            <Link href={`/medical/registrations?period=${selectedPeriod}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              Registrations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
          <span className="text-slate-400">Period: </span>
          <span className="font-semibold text-white">{periodLabel}</span>
          <span className="mx-3 text-slate-500">·</span>
          <span className="text-xs italic text-slate-400">Medical data integration pending</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {kpiCards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <div className={`rounded-xl p-2 ${accent ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-500"}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className={`mt-4 text-3xl font-semibold leading-none ${accent ? "text-sky-600" : "text-slate-900"}`}>{value}</p>
            <p className="mt-2 text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Medical Modules</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
              {label} <ArrowRight className="h-4 w-4 opacity-40" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
