import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPeriods } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string }> };

const departments = [
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "IT & Technology",
  "Logistics",
  "Customer Service",
];

export default async function HrHeadcountPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">HR</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Headcount Detail — {periodLabel}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Department-by-department breakdown of staff, open roles, and movements.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form method="get" className="flex items-center gap-2">
              <select
                name="period"
                defaultValue={selectedPeriod}
                className="h-10 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none"
              >
                {periods.map((p) => (
                  <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>
                ))}
              </select>
              <button type="submit" className="h-10 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300">
                Apply
              </button>
            </form>
            <Link
              href="/hr"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              HR Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Headcount By Department</h2>
        <p className="mt-1 text-sm text-slate-500">HR data integration pending — structure ready for headcount data.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Department</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Current</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Target</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Open Roles</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">New Hires</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Exits</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept} className="border-b border-slate-50">
                  <td className="py-3 font-medium text-slate-800">{dept}</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                  <td className="py-3 text-right text-slate-400">—</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Total</td>
                <td className="py-3 text-right font-semibold text-slate-700">—</td>
                <td className="py-3 text-right font-semibold text-slate-700">—</td>
                <td className="py-3 text-right font-semibold text-slate-700">—</td>
                <td className="py-3 text-right font-semibold text-slate-700">—</td>
                <td className="py-3 text-right font-semibold text-slate-700">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Recruitment Pipeline</h2>
        <p className="mt-1 text-sm text-slate-500">Active openings and hiring stage tracking — integration pending.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Position</th>
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Department</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Applicants</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Interviews</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Stage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                  No open positions on record — add roles via HR Tasks or connect your ATS.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
