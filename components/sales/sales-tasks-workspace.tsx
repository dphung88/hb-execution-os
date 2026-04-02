"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckSquare, Filter, TimerReset, TrendingUp } from "lucide-react";

import { createSalesTaskAction, updateSalesTaskAction, deleteSalesTaskAction } from "@/app/(app)/sales-performance/tasks/actions";
import { SALES_OWNERS, SALES_STATUSES } from "@/lib/sales/config";
import type { SalesTaskRecord } from "@/lib/sales/tasks";
import type { PeriodConfig } from "@/lib/config/periods";
import { PeriodSelector } from "@/components/ui/period-selector";

function normalize(v: string) { return v.trim().toLowerCase(); }

const STATUS_COLORS: Record<string, { dot: string; num: string; note: string }> = {
  "planned":      { dot: "bg-slate-400",   num: "text-slate-800",   note: "Queued for execution" },
  "in progress":  { dot: "bg-sky-500",     num: "text-sky-700",     note: "Currently being worked" },
  "under review": { dot: "bg-amber-400",   num: "text-amber-700",   note: "Awaiting approval" },
  "completed":    { dot: "bg-emerald-500", num: "text-emerald-700", note: "Done this period" },
  "failed":       { dot: "bg-rose-500",    num: "text-rose-700",    note: "Needs reset or escalation" },
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High:     "bg-orange-100 text-orange-700 border-orange-200",
  Medium:   "bg-amber-100 text-amber-700 border-amber-200",
  Low:      "bg-slate-100 text-slate-600 border-slate-200",
};

type Props = {
  tasks: SalesTaskRecord[];
  source: "live" | "demo";
  periods?: PeriodConfig[];
  selectedPeriod?: string;
  searchParams?: {
    period?: string;
    owner?: string;
    status?: string;
    saved?: string;
    error?: string;
  };
};

export function SalesTasksWorkspace({ tasks, source, searchParams, periods = [], selectedPeriod = "" }: Props) {
  const [createPeriod, setCreatePeriod] = useState(selectedPeriod);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = e.target.value;
    if (!d) return;
    const match = periods.find((p) => d >= p.startDate && d <= p.endDate);
    if (match) setCreatePeriod(match.key); else setCreatePeriod(d.slice(0, 7));
  }

  const ownerFilter  = searchParams?.owner  ?? "all";
  const statusFilter = searchParams?.status ?? "all";

  const filtered = tasks.filter((t) => {
    const ownerOk  = ownerFilter  === "all" || normalize(t.owner)  === normalize(ownerFilter);
    const statusOk = statusFilter === "all" || normalize(t.status) === normalize(statusFilter);
    return ownerOk && statusOk;
  });

  const counts = {
    planned:     filtered.filter((t) => normalize(t.status) === "planned").length,
    inProgress:  filtered.filter((t) => normalize(t.status) === "in progress").length,
    underReview: filtered.filter((t) => normalize(t.status) === "under review").length,
    completed:   filtered.filter((t) => normalize(t.status) === "completed").length,
    failed:      filtered.filter((t) => normalize(t.status) === "failed").length,
  };

  const today = new Date().toISOString().slice(0, 10);
  const overdue = filtered.filter((t) => t.dueDate && t.dueDate < today && !["Completed", "Failed"].includes(t.status));

  // Workload per owner
  const workloadMap = new Map<string, {
    total: number; completed: number; progressRaw: number;
    inProgress: number; underReview: number; failed: number; planned: number;
  }>();
  for (const t of filtered) {
    const r = workloadMap.get(t.owner) ?? { total: 0, completed: 0, progressRaw: 0, inProgress: 0, underReview: 0, failed: 0, planned: 0 };
    r.total++;
    if (t.status === "Completed")                r.completed++;
    if (normalize(t.status) === "in progress")   r.inProgress++;
    if (normalize(t.status) === "under review")  r.underReview++;
    if (normalize(t.status) === "failed")        r.failed++;
    if (normalize(t.status) === "planned")       r.planned++;
    r.progressRaw += t.progressPercent;
    workloadMap.set(t.owner, r);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">Sales Tasks</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Task workspace for the Sales team.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Track and manage Sales team tasks — drive execution quality and accountability across all ASMs and managers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {periods.length > 0 && (
              <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} basePath="/sales-performance/tasks" />
            )}
            <div className="hidden h-6 w-px bg-white/15 sm:block" />
            <Link
              href="/sales-performance"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sales Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Planned",      value: counts.planned,     key: "planned" },
          { label: "In Progress",  value: counts.inProgress,  key: "in progress" },
          { label: "Under Review", value: counts.underReview, key: "under review" },
          { label: "Completed",    value: counts.completed,   key: "completed" },
          { label: "Failed",       value: counts.failed,      key: "failed" },
        ].map((card) => {
          const c = STATUS_COLORS[card.key];
          return (
            <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              </div>
              <p className={`mt-3 text-3xl font-semibold ${c.num}`}>{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{c.note}</p>
            </div>
          );
        })}
      </section>

      {/* Banners */}
      {searchParams?.saved && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-emerald-900">
            {searchParams.saved === "create" ? "New task created." : searchParams.saved === "delete" ? "Task deleted." : "Task updated successfully."}
          </p>
        </section>
      )}
      {searchParams?.error && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Save failed</p>
          <p className="mt-1 text-sm text-rose-800">
            {searchParams.error === "missing-table"
              ? "The sales_tasks table is missing — run the SQL migration first."
              : searchParams.error === "rls-blocked"
              ? "Row-level security is blocking writes."
              : "Write connection not configured."}
          </p>
        </section>
      )}

      {/* Create task */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700"><CheckSquare className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">New Task</p>
            <h2 className="text-2xl font-semibold text-slate-900">Create A Sales Task</h2>
          </div>
        </div>

        <form action={createSalesTaskAction} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Task name</span>
            <input name="task_name" required className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reporting period</span>
            <select name="month_key" value={createPeriod} onChange={(e) => setCreatePeriod(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {periods.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              {periods.length === 0 && <option value={selectedPeriod}>{selectedPeriod}</option>}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</span>
            <select name="owner_name" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {SALES_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Requester</span>
            <input name="request_source" placeholder="e.g. CEO, VP Sales" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select name="status" defaultValue="Planned" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {SALES_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</span>
            <select name="priority" defaultValue="Medium" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {["Low", "Medium", "High", "Critical"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Due date</span>
            <input type="date" name="due_date" onChange={handleDueDateChange} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Progress %</span>
            <input type="number" name="progress_percent" defaultValue={0} min={0} max={100} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Note</span>
            <input name="result_note" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
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
          <h2 className="text-2xl font-semibold text-slate-900">Filter By Owner And Status</h2>
        </div>
        <form method="get" className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr,1fr,140px]">
          <input type="hidden" name="period" value={selectedPeriod} />
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</span>
            <select name="owner" defaultValue={ownerFilter} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              <option value="all">All owners</option>
              {SALES_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select name="status" defaultValue={statusFilter} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              <option value="all">All statuses</option>
              {SALES_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" className="mt-[1.55rem] inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            Apply
          </button>
        </form>
      </section>

      {/* Workload */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700"><TrendingUp className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Workload</p>
            <h2 className="text-2xl font-semibold text-slate-900">Task Count By Owner</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SALES_OWNERS.map((owner) => {
            const r = workloadMap.get(owner) ?? { total: 0, completed: 0, progressRaw: 0, inProgress: 0, underReview: 0, failed: 0, planned: 0 };
            const avg = r.total ? Math.round(r.progressRaw / r.total) : 0;
            return (
              <div key={owner} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{owner}</p>
                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">
                    {r.total} task{r.total !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Done <span className="font-medium text-emerald-600">{r.completed}</span>
                  {" · "}Avg <span className="font-medium text-slate-700">{avg}%</span>
                </p>
                {r.total > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
                    {r.planned    > 0 && <span className="text-slate-500">● {r.planned} Planned</span>}
                    {r.inProgress > 0 && <span className="text-sky-600">● {r.inProgress} In Progress</span>}
                    {r.underReview > 0 && <span className="text-amber-600">● {r.underReview} Review</span>}
                    {r.completed  > 0 && <span className="text-emerald-600">● {r.completed} Done</span>}
                    {r.failed     > 0 && <span className="text-rose-600">● {r.failed} Failed</span>}
                  </div>
                )}
                {r.total > 0 && (
                  <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    {r.planned    > 0 && <div className="h-full bg-slate-400" style={{ width: `${(r.planned    / r.total) * 100}%` }} />}
                    {r.inProgress > 0 && <div className="h-full bg-sky-500"   style={{ width: `${(r.inProgress / r.total) * 100}%` }} />}
                    {r.underReview > 0 && <div className="h-full bg-amber-400" style={{ width: `${(r.underReview / r.total) * 100}%` }} />}
                    {r.completed  > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(r.completed  / r.total) * 100}%` }} />}
                    {r.failed     > 0 && <div className="h-full bg-rose-500"  style={{ width: `${(r.failed     / r.total) * 100}%` }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Overdue */}
      {overdue.length > 0 && (
        <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700"><TimerReset className="h-5 w-5" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Overdue Watch</p>
              <h2 className="text-2xl font-semibold text-slate-900">Tasks Needing Intervention</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {overdue.map((t) => (
              <div key={t.id} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-900">{t.owner}</p>
                <p className="mt-0.5 text-xs text-rose-700">{t.status} · Due {t.dueDate}</p>
                <p className="mt-1 text-xs font-medium text-rose-800">{t.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Task list */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">All Tasks</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks match the current filters.</p>
          ) : filtered.map((task) => {
            const isExpanded = expandedId === task.id;
            const isOverdue  = task.dueDate && task.dueDate < today && !["Completed", "Failed"].includes(task.status);
            const sc = STATUS_COLORS[normalize(task.status)] ?? STATUS_COLORS.planned;
            const pc = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.Low;

            return (
              <div key={task.id} className={`rounded-2xl border ${isOverdue ? "border-rose-200 bg-rose-50/30" : "border-slate-200 bg-white"}`}>
                {/* Row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                  className="w-full text-left px-5 py-4"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.owner} · {task.status}
                        {task.dueDate && <span className={isOverdue ? " font-semibold text-rose-600" : ""}> · Due {task.dueDate}</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pc}`}>{task.priority}</span>
                      <span className="text-xs text-slate-400">{task.progressPercent}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${task.progressPercent >= 80 ? "bg-emerald-500" : task.progressPercent >= 50 ? "bg-sky-500" : task.progressPercent >= 30 ? "bg-amber-400" : "bg-rose-400"}`}
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    {task.notes && <p className="mb-4 text-sm text-slate-600 leading-relaxed">{task.notes}</p>}
                    <form action={updateSalesTaskAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <input type="hidden" name="task_id" value={task.id} />
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
                        <select name="status" defaultValue={task.status} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400">
                          {SALES_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Progress %</span>
                        <input type="number" name="progress_percent" defaultValue={task.progressPercent} min={0} max={100} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400" />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Note</span>
                        <input name="result_note" defaultValue={task.notes} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400" />
                      </label>
                      <div className="sm:col-span-2 xl:col-span-4 flex justify-between gap-3">
                        <form action={deleteSalesTaskAction}>
                          <input type="hidden" name="task_id" value={task.id} />
                          <button type="submit" className="inline-flex h-10 items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                            Delete
                          </button>
                        </form>
                        <button type="submit" className="inline-flex h-10 items-center rounded-xl bg-slate-950 px-5 text-xs font-semibold text-white transition hover:bg-slate-800">
                          Save changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {source === "demo" && (
        <p className="text-center text-xs text-slate-400">
          Showing demo data — run the SQL migration and add real tasks to see live data.
        </p>
      )}
    </div>
  );
}
