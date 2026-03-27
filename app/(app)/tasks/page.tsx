import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPeriods } from "@/lib/config/periods";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

// Demo fallback data from each module's config
import { DEMO_FINANCE_TASKS } from "@/lib/finance/config";
import { DEMO_HR_TASKS } from "@/lib/hr/config";
import { DEMO_MEDICAL_TASKS } from "@/lib/medical/config";
import { DEMO_IT_TASKS } from "@/lib/it/config";
import { DEMO_SC_TASKS } from "@/lib/supply-chain/config";

type Props = { searchParams?: Promise<{ period?: string }> };

const ALL_STATUSES = ["Planned", "In Progress", "Under Review", "Completed", "Failed"] as const;
type Status = (typeof ALL_STATUSES)[number];

type DeptStat = {
  name: string;
  tasksHref: string;
  counts: Record<Status, number>;
  total: number;
};

function countByStatus(rows: Array<{ status: string }>): Record<Status, number> {
  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const r of rows) {
    if (r.status in counts) counts[r.status as Status]++;
  }
  return counts;
}

async function loadDeptStats(period: string): Promise<{ depts: DeptStat[]; fromDb: boolean }> {
  // Supabase path
  if (hasSupabaseAdminEnv()) {
    try {
      const admin = createAdminClient();
      const [finance, hr, medical, it, sc] = await Promise.all([
        admin.from("finance_tasks").select("status").eq("month_key", period),
        admin.from("hr_tasks").select("status").eq("month_key", period),
        admin.from("medical_tasks").select("status").eq("month_key", period),
        admin.from("it_tasks").select("status").eq("month_key", period),
        admin.from("sc_tasks").select("status").eq("month_key", period),
      ]);

      const depts: DeptStat[] = [
        { name: "Finance",      tasksHref: `/finance/tasks?period=${period}`,      counts: countByStatus((finance.data ?? []) as {status:string}[]),      total: (finance.data  ?? []).length },
        { name: "HR",           tasksHref: `/hr/tasks?period=${period}`,           counts: countByStatus((hr.data ?? []) as {status:string}[]),           total: (hr.data       ?? []).length },
        { name: "Medical",      tasksHref: `/medical/tasks?period=${period}`,      counts: countByStatus((medical.data ?? []) as {status:string}[]),      total: (medical.data  ?? []).length },
        { name: "IT",           tasksHref: `/it/tasks?period=${period}`,           counts: countByStatus((it.data ?? []) as {status:string}[]),           total: (it.data       ?? []).length },
        { name: "Supply Chain", tasksHref: `/supply-chain/tasks?period=${period}`, counts: countByStatus((sc.data ?? []) as {status:string}[]),           total: (sc.data       ?? []).length },
      ];
      return { depts, fromDb: true };
    } catch { /* fall through to demo */ }
  }

  // Demo fallback
  const depts: DeptStat[] = [
    { name: "Finance",      tasksHref: `/finance/tasks?period=${period}`,      counts: countByStatus(DEMO_FINANCE_TASKS),  total: DEMO_FINANCE_TASKS.length  },
    { name: "HR",           tasksHref: `/hr/tasks?period=${period}`,           counts: countByStatus(DEMO_HR_TASKS),       total: DEMO_HR_TASKS.length       },
    { name: "Medical",      tasksHref: `/medical/tasks?period=${period}`,      counts: countByStatus(DEMO_MEDICAL_TASKS),  total: DEMO_MEDICAL_TASKS.length  },
    { name: "IT",           tasksHref: `/it/tasks?period=${period}`,           counts: countByStatus(DEMO_IT_TASKS),       total: DEMO_IT_TASKS.length       },
    { name: "Supply Chain", tasksHref: `/supply-chain/tasks?period=${period}`, counts: countByStatus(DEMO_SC_TASKS),       total: DEMO_SC_TASKS.length       },
  ];
  return { depts, fromDb: false };
}

const STATUS_STYLE: Record<Status, string> = {
  "Planned":      "bg-slate-100 text-slate-600",
  "In Progress":  "bg-sky-100 text-sky-700",
  "Under Review": "bg-violet-100 text-violet-700",
  "Completed":    "bg-emerald-100 text-emerald-700",
  "Failed":       "bg-rose-100 text-rose-700",
};

export default async function TaskReportPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const { depts, fromDb } = await loadDeptStats(selectedPeriod);

  // Aggregate totals
  const grandTotal = depts.reduce((s, d) => s + d.total, 0);
  const aggCounts = Object.fromEntries(
    ALL_STATUSES.map((s) => [s, depts.reduce((sum, d) => sum + d.counts[s], 0)])
  ) as Record<Status, number>;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Task Management</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Cross-Department Task Report
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Period snapshot — status breakdown per department with task counts.
            </p>
          </div>
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
            <button
              type="submit"
              className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Apply
            </button>
          </form>
        </div>

        {/* Period bar */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
          <span className="text-slate-400">Period: </span>
          <span className="font-semibold text-white">{periodLabel}</span>
          <span className="mx-3 text-slate-500">·</span>
          <span className="text-slate-400 text-xs italic">{fromDb ? "Live data" : "Demo data — connect Supabase to populate"}</span>
        </div>
      </section>

      {/* Aggregate summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">All Tasks</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{grandTotal}</p>
          <p className="mt-1 text-xs text-slate-400">5 departments</p>
        </div>
        {ALL_STATUSES.map((status) => (
          <div key={status} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{status}</p>
            <p className={`mt-3 text-2xl font-semibold ${
              status === "Completed" ? "text-emerald-600" :
              status === "In Progress" ? "text-sky-600" :
              status === "Failed" ? "text-rose-600" :
              status === "Under Review" ? "text-violet-600" :
              "text-slate-700"
            }`}>{aggCounts[status]}</p>
            <p className="mt-1 text-xs text-slate-400">
              {grandTotal > 0 ? `${Math.round((aggCounts[status] / grandTotal) * 100)}%` : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Department breakdown table */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Status Breakdown by Department</h2>
        <p className="mt-1 text-sm text-slate-500">
          {grandTotal > 0
            ? `${grandTotal} tasks across ${depts.length} departments for ${periodLabel}.`
            : `No tasks logged for ${periodLabel} yet — click a department to add tasks.`}
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 min-w-[120px]">Department</th>
                {ALL_STATUSES.map((s) => (
                  <th key={s} className="pb-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 min-w-[90px]">
                    {s}
                  </th>
                ))}
                <th className="pb-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 min-w-[60px]">Total</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {depts.map((dept) => (
                <tr key={dept.name} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 font-semibold text-slate-800">{dept.name}</td>
                  {ALL_STATUSES.map((s) => (
                    <td key={s} className="py-3 text-center">
                      {dept.counts[s] > 0 ? (
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s]}`}>
                          {dept.counts[s]}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 text-center font-semibold text-slate-900">
                    {dept.total > 0 ? dept.total : <span className="text-slate-300">0</span>}
                  </td>
                  <td className="py-3 pl-4">
                    <Link
                      href={dept.tasksHref}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Totals row */}
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Total</td>
                {ALL_STATUSES.map((s) => (
                  <td key={s} className="py-3 text-center font-semibold text-slate-700">
                    {aggCounts[s] > 0 ? aggCounts[s] : <span className="text-slate-300">0</span>}
                  </td>
                ))}
                <td className="py-3 text-center font-bold text-slate-900">{grandTotal}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Progress bars by department */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Completion Progress</h2>
        <p className="mt-1 text-sm text-slate-500">Completed vs total tasks per department for {periodLabel}.</p>

        <div className="mt-5 space-y-4">
          {depts.map((dept) => {
            const pct = dept.total > 0 ? Math.round((dept.counts["Completed"] / dept.total) * 100) : 0;
            const inProgressPct = dept.total > 0 ? Math.round((dept.counts["In Progress"] / dept.total) * 100) : 0;
            return (
              <div key={dept.name}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {dept.counts["Completed"]}/{dept.total} completed
                    {dept.total > 0 && <span className="ml-1.5 text-xs font-normal text-slate-400">({pct}%)</span>}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="flex h-full">
                    <div
                      className="bg-emerald-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="bg-sky-300 transition-all"
                      style={{ width: `${inProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" />In Progress</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-100 border border-slate-200" />Remaining</span>
        </div>
      </section>
    </div>
  );
}
