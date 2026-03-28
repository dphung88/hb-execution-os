import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string }> };

const systems = [
  { name: "ERP System",            category: "Core",          status: "operational" },
  { name: "Execution OS (Web App)",category: "Core",          status: "operational" },
  { name: "Supabase Database",     category: "Core",          status: "operational" },
  { name: "Email Server",          category: "Communication", status: "operational" },
  { name: "VPN Gateway",           category: "Network",       status: "operational" },
  { name: "File Server / NAS",     category: "Storage",       status: "operational" },
  { name: "CCTV / Security",       category: "Security",      status: "operational" },
  { name: "Backup System",         category: "Storage",       status: "operational" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "operational")
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" />Operational</span>;
  if (status === "degraded")
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700"><AlertCircle className="h-3 w-3" />Degraded</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-0.5 text-xs font-semibold text-rose-700"><XCircle className="h-3 w-3" />Down</span>;
}

export default async function ItSystemStatusPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const operational = systems.filter((s) => s.status === "operational").length;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">IT</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              System Status — {periodLabel}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Real-time infrastructure health and uptime overview.</p>
          </div>
          <Link href="/it"
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> IT Dashboard
          </Link>
        </div>
      </section>

      {/* Overall status */}
      <section className={`rounded-3xl border p-6 shadow-panel ${operational === systems.length ? "border-emerald-200 bg-emerald-50/90" : "border-amber-200 bg-amber-50/90"}`}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className={`h-6 w-6 ${operational === systems.length ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <p className={`text-sm font-semibold ${operational === systems.length ? "text-emerald-900" : "text-amber-900"}`}>
              {operational === systems.length ? "All systems operational" : `${systems.length - operational} system(s) need attention`}
            </p>
            <p className={`text-xs ${operational === systems.length ? "text-emerald-700" : "text-amber-700"}`}>
              {operational} of {systems.length} systems running normally
            </p>
          </div>
        </div>
      </section>

      {/* System table */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Infrastructure Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Update status manually until monitoring API is connected.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">System</th>
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Category</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Uptime</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Last Incident</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((sys) => (
                <tr key={sys.name} className="border-b border-slate-50">
                  <td className="py-3 font-medium text-slate-800">{sys.name}</td>
                  <td className="py-3 text-slate-500">{sys.category}</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right"><StatusBadge status={sys.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
