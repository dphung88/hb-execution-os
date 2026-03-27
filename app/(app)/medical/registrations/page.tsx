import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPeriods } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string }> };

type Section = { label: string; rows: string[] };

const sections: Section[] = [
  { label: "Active Registrations", rows: ["Product A", "Product B", "Product C", "Product D"] },
  { label: "Pending Renewal (< 90 days)", rows: [] },
  { label: "Submitted — Awaiting Authority Review", rows: [] },
];

export default async function MedicalRegistrationsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Medical</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Product Registrations — {periodLabel}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Track registration status, expiry dates, and regulatory submissions by product.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form method="get" className="flex items-center gap-2">
              <select name="period" defaultValue={selectedPeriod}
                className="h-10 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none">
                {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
              </select>
              <button type="submit" className="h-10 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300">Apply</button>
            </form>
            <Link href="/medical"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Medical Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Registration Tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Medical registration data integration pending — structure ready.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Product</th>
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">License No.</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Issue Date</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Expiry Date</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Days Left</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(({ label, rows }) => (
                <React.Fragment key={label}>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={6} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</td>
                  </tr>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 pl-4 text-sm text-slate-400">No records — connect registration database to populate.</td>
                    </tr>
                  ) : rows.map((row) => (
                    <tr key={row} className="border-b border-slate-50">
                      <td className="py-2.5 pl-2 font-medium text-slate-700">{row}</td>
                      <td className="py-2.5 text-slate-400">—</td>
                      <td className="py-2.5 text-right text-slate-400">—</td>
                      <td className="py-2.5 text-right text-slate-400">—</td>
                      <td className="py-2.5 text-right text-slate-400">—</td>
                      <td className="py-2.5 text-right text-slate-400">—</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
