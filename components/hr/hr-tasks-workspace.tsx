"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckSquare, Filter, TimerReset } from "lucide-react";
import { createHrTaskAction } from "@/app/(app)/hr/tasks/actions";
import { HR_OWNERS, HR_STATUSES, type HrTaskRecord } from "@/lib/hr/config";
import type { PeriodConfig } from "@/lib/config/periods";
import { PeriodSelector } from "@/components/ui/period-selector";

type Props = {
  tasks: HrTaskRecord[];
  source: "live" | "sheet" | "empty";
  periods?: PeriodConfig[];
  selectedPeriod?: string;
  searchParams?: { period?: string; owner?: string; status?: string; saved?: string; error?: string };
};

function toneClass(status: string) {
  const s = status.toLowerCase();
  if (s === "completed")    return "bg-emerald-100 text-emerald-700";
  if (s === "in progress")  return "bg-sky-100 text-sky-700";
  if (s === "under review") return "bg-amber-100 text-amber-700";
  if (s === "failed")       return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function normalize(v: string) { return v.trim().toLowerCase(); }

export function HrTasksWorkspace({ tasks, source, searchParams, periods = [], selectedPeriod = "" }: Props) {
  const [createPeriod, setCreatePeriod] = useState(selectedPeriod);
  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = e.target.value;
    if (!d) return;
    const match = periods.find((p) => d >= p.startDate && d <= p.endDate);
    if (match) setCreatePeriod(match.key); else setCreatePeriod(d.slice(0, 7));
  }
  const ownerFilter  = searchParams?.owner  ?? "all";
  const statusFilter = searchParams?.status ?? "all";
  const savedState   = searchParams?.saved;
  const errorState   = searchParams?.error;

  const allStatuses = Array.from(new Set([...HR_STATUSES, ...tasks.map((t) => t.status)]));

  const filtered = tasks.filter((t) => {
    const ownerOk  = ownerFilter  === "all" || normalize(t.owner)  === normalize(ownerFilter);
    const statusOk = statusFilter === "all" || normalize(t.status) === normalize(statusFilter);
    return ownerOk && statusOk;
  });

  const counts = {
    planned:    filtered.filter((t) => normalize(t.status) === "planned").length,
    inProgress: filtered.filter((t) => normalize(t.status) === "in progress").length,
    completed:  filtered.filter((t) => normalize(t.status) === "completed").length,
    failed:     filtered.filter((t) => normalize(t.status) === "failed").length,
  };

  const today = new Date().toISOString().slice(0, 10);
  const overdue = filtered.filter((t) => t.dueDate && t.dueDate < today && !["Completed", "Failed"].includes(t.status));

  const workloadMap = new Map<string, { total: number; active: number; completed: number; progressRaw: number }>();
  for (const t of filtered) {
    const r = workloadMap.get(t.owner) ?? { total: 0, active: 0, completed: 0, progressRaw: 0 };
    r.total++;
    if (!["Completed", "Failed"].includes(t.status)) r.active++;
    if (t.status === "Completed") r.completed++;
    r.progressRaw += t.progressPercent;
    workloadMap.set(t.owner, r);
  }


  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">HR Tasks</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Daily task workspace for the HR team.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Create and track HR deliverables — recruitment, payroll, training, compliance, and headcount tasks — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {periods.length > 0 && (
              <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} basePath="/hr/tasks" />
            )}
            <div className="hidden h-6 w-px bg-white/15 sm:block" />
            <Link
              href="/hr"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              HR Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Planned",     value: counts.planned,    note: "Queued for execution" },
          { label: "In Progress", value: counts.inProgress, note: "Currently being worked" },
          { label: "Completed",   value: counts.completed,  note: "Done this period" },
          { label: "Failed",      value: counts.failed,     note: "Needs reset or escalation" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      {/* Banners */}
      {savedState && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-emerald-900">Task saved</p>
          <p className="mt-1 text-sm text-emerald-800">
            {savedState === "create" ? "New HR task created." : "Task updated successfully."}
          </p>
        </section>
      )}
      {errorState && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Save failed</p>
          <p className="mt-1 text-sm text-rose-800">
            {errorState === "missing-table"
              ? "The hr_tasks table is missing — run the SQL migration first."
              : errorState === "rls-blocked"
              ? "Row-level security is blocking writes."
              : "Write connection not configured."}
          </p>
        </section>
      )}

      {/* Create form */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">New Task</p>
            <h2 className="text-2xl font-semibold text-slate-900">Create An HR Task</h2>
          </div>
        </div>

        <form action={createHrTaskAction} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Task name</span>
            <input name="task_name" required className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reporting period</span>
            <select name="month_key" value={createPeriod} onChange={(e) => setCreatePeriod(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {periods.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              {periods.length === 0 && <option value={selectedPeriod}>{selectedPeriod}</option>}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</span>
            <select name="owner_name" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {HR_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Requester</span>
            <input name="request_source" placeholder="e.g. CEO, HR Director" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select name="status" defaultValue="Planned" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {HR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</span>
            <select name="priority" defaultValue="Medium" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {["Low", "Medium", "High", "Critical"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Due date</span>
            <input type="date" name="due_date" onChange={handleDueDateChange} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Progress %</span>
            <input type="number" name="progress_percent" defaultValue={0} min={0} max={100} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Note</span>
            <input name="result_note" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <div className="xl:col-span-3 flex justify-end">
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Create task
            </button>
          </div>
        </form>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700"><Filter className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Filters</p>
            <h2 className="text-2xl font-semibold text-slate-900">Filter By Owner And Status</h2>
          </div>
        </div>
        <form method="get" className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr,1fr,140px]">
          <input type="hidden" name="period" value={selectedPeriod} />
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</span>
            <select name="owner" defaultValue={ownerFilter} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              <option value="all">All owners</option>
              {HR_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select name="status" defaultValue={statusFilter} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              <option value="all">All statuses</option>
              {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" className="mt-[1.55rem] inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            Apply
          </button>
        </form>
      </section>

      {/* Workload — full width, clickable owner cards */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Workload</p>
            <h2 className="text-2xl font-semibold text-slate-900">Task Count By Owner</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {HR_OWNERS.map((owner) => {
            const r = workloadMap.get(owner) ?? { total: 0, active: 0, completed: 0, progressRaw: 0 };
            const avg = r.total ? Math.round(r.progressRaw / r.total) : 0;
            return (
              <Link
                key={owner}
                href={`/hr/tasks/owner/${encodeURIComponent(owner)}?period=${selectedPeriod}`}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-sky-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-700">{owner}</p>
                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">
                    {r.total} task{r.total !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Active <span className="font-medium text-slate-700">{r.active}</span>
                  {" · "}Completed <span className="font-medium text-slate-700">{r.completed}</span>
                  {" · "}Avg <span className="font-medium text-slate-700">{avg}%</span>
                </p>
                {r.total > 0 && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round((r.completed / r.total) * 100)}%` }} />
                  </div>
                )}
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-sky-500 opacity-0 transition group-hover:opacity-100">
                  View tasks →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Overdue Watch — full width */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-700"><TimerReset className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Overdue Watch</p>
            <h2 className="text-2xl font-semibold text-slate-900">Tasks Needing Intervention</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overdue.length ? overdue.map((t) => (
            <Link
              key={t.id}
              href={`/hr/tasks/owner/${encodeURIComponent(t.owner)}?period=${selectedPeriod}`}
              className="group rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 transition hover:border-rose-400 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-rose-900 group-hover:text-rose-700">{t.owner}</p>
              <p className="mt-0.5 text-xs text-rose-700">{t.status} · Due {t.dueDate}</p>
              <p className="mt-1 text-xs font-medium text-rose-800">{t.title}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-rose-500 opacity-0 transition group-hover:opacity-100">View & update →</p>
            </Link>
          )) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No overdue tasks — all good!
            </div>
          )}
        </div>
      </section>

      {source === "empty" && (
        <p className="text-center text-xs text-slate-400">No tasks yet for this period — create one above, or connect a Google Sheet via env var.</p>
      )}
    </div>
  );
}
