"use client";

import Link from "next/link";
import { CalendarDays, CheckSquare, Filter, FolderKanban, TimerReset } from "lucide-react";
import { createItTaskAction, updateItTaskAction } from "@/app/(app)/it/tasks/actions";
import { IT_OWNERS, IT_STATUSES, type ItTaskRecord } from "@/lib/it/config";
import type { PeriodConfig } from "@/lib/config/periods";
import { PeriodSelector } from "@/components/ui/period-selector";

type Props = {
  tasks: ItTaskRecord[];
  source: "live" | "demo";
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

export function ItTasksWorkspace({ tasks, source, searchParams, periods = [], selectedPeriod = "" }: Props) {
  const ownerFilter  = searchParams?.owner  ?? "all";
  const statusFilter = searchParams?.status ?? "all";
  const savedState   = searchParams?.saved;
  const errorState   = searchParams?.error;

  const allStatuses = Array.from(new Set([...IT_STATUSES, ...tasks.map((t) => t.status)]));

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

  const boardRows = IT_OWNERS.map((owner) => {
    const ownerTasks = filtered
      .filter((t) => normalize(t.owner) === normalize(owner))
      .sort((a, b) => new Date(b.dueDate || "").getTime() - new Date(a.dueDate || "").getTime());
    return { owner, task: ownerTasks[0] ?? null };
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">IT Tasks</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Daily task workspace for the IT team.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Track system upgrades, deployments, helpdesk resolution, network maintenance, and IT project delivery — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {periods.length > 0 && (
              <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} basePath="/it/tasks" />
            )}
            <div className="hidden h-6 w-px bg-white/15 sm:block" />
            <Link href="/it" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15">
              IT Dashboard
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
          <p className="mt-1 text-sm text-emerald-800">{savedState === "create" ? "New IT task created." : "Task updated successfully."}</p>
        </section>
      )}
      {errorState && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Save failed</p>
          <p className="mt-1 text-sm text-rose-800">
            {errorState === "missing-table" ? "The it_tasks table is missing — run the SQL migration first."
              : errorState === "rls-blocked" ? "Row-level security is blocking writes."
              : "Write connection not configured."}
          </p>
        </section>
      )}

      {/* Create form */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><CheckSquare className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">New Task</p>
            <h2 className="text-2xl font-semibold text-slate-900">Create An IT Task</h2>
          </div>
        </div>
        <form action={createItTaskAction} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input type="hidden" name="month_key" value={selectedPeriod} />
          <label className="block xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Task name</span>
            <input name="task_name" required className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</span>
            <select name="owner_name" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {IT_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Requester</span>
            <input name="request_source" placeholder="e.g. CEO, IT Director" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select name="status" defaultValue="Planned" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400">
              {IT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
            <input type="date" name="due_date" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
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
              {IT_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
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

      {/* Task board */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><FolderKanban className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Task Board</p>
            <h2 className="text-2xl font-semibold text-slate-900">Execution Tracker By Owner</h2>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[1fr,140px,100px,90px,1fr,80px] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <div>Task</div><div>Status</div><div>Due date</div><div>Progress</div><div>Note</div><div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-slate-100">
              {boardRows.map(({ owner, task }) => (
                <form key={task?.id ?? owner} action={task ? updateItTaskAction : undefined}
                  className="grid grid-cols-[1fr,140px,100px,90px,1fr,80px] items-start gap-3 px-5 py-4">
                  {task && <input type="hidden" name="task_id" value={task.id} />}
                  {task && <input type="hidden" name="file_link" value={task.fileLink ?? ""} />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task?.title ?? "No task logged yet"}</p>
                    <p className="mt-1 text-xs text-slate-500">{owner}{task ? ` · ${task.requester}` : " · Awaiting first task"}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{task?.priority ?? "-"}</span>
                      {task && <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${toneClass(task.status)}`}>{task.status}</span>}
                    </div>
                  </div>
                  <div>
                    <select name="status" defaultValue={task?.status ?? "Planned"} disabled={!task}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-400">
                      {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="pt-2 text-xs text-slate-600">{task?.dueDate || "—"}</div>
                  <div>
                    <input type="number" name="progress_percent" defaultValue={task?.progressPercent ?? 0} min={0} max={100} disabled={!task}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div>
                    <input name="result_note" defaultValue={task?.notes ?? ""} disabled={!task}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={!task}
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40">
                      Save
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom panels */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700"><TimerReset className="h-5 w-5" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Overdue Watch</p>
              <h2 className="text-xl font-semibold text-slate-900">Tasks Needing Intervention</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {overdue.length ? overdue.map((t) => (
              <div key={t.id} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-900">{t.owner}</p>
                <p className="mt-0.5 text-xs text-rose-700">{t.status} · Due {t.dueDate}</p>
                <p className="mt-1 text-xs text-rose-800">{t.title}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">No overdue tasks.</div>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><CalendarDays className="h-5 w-5" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Workload</p>
              <h2 className="text-xl font-semibold text-slate-900">Task Count By Owner</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {IT_OWNERS.map((owner) => {
              const r = workloadMap.get(owner) ?? { total: 0, active: 0, completed: 0, progressRaw: 0 };
              const avg = r.total ? Math.round(r.progressRaw / r.total) : 0;
              return (
                <div key={owner} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{owner}</p>
                    <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-700">{r.total} task{r.total !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Active {r.active} · Completed {r.completed} · Avg progress {avg}%</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {source === "demo" && (
        <p className="text-center text-xs text-slate-400">Showing demo data — run the SQL migration and add real tasks to see live data.</p>
      )}
    </div>
  );
}
