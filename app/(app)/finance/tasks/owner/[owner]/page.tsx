import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { loadFinanceTasks } from "@/lib/finance/tasks";
import { FINANCE_STATUSES } from "@/lib/finance/config";
import { updateFinanceTaskAction } from "@/app/(app)/finance/tasks/actions";

type Props = {
  params: Promise<{ owner: string }>;
  searchParams?: Promise<{ period?: string; saved?: string }>;
};

function toneClass(status: string) {
  const s = status.toLowerCase();
  if (s === "completed")    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "in progress")  return "bg-sky-100 text-sky-700 border-sky-200";
  if (s === "under review") return "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "failed")       return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function priorityClass(p: string) {
  if (p === "Critical") return "bg-rose-100 text-rose-700";
  if (p === "High")     return "bg-orange-100 text-orange-700";
  if (p === "Low")      return "bg-slate-100 text-slate-500";
  return "bg-slate-100 text-slate-600";
}

export default async function FinanceOwnerDetailPage({ params, searchParams }: Props) {
  const { owner: ownerSlug } = await params;
  const owner = decodeURIComponent(ownerSlug);
  const sp = searchParams ? await searchParams : undefined;

  const periods = await getPeriods();
  const selectedPeriod = sp?.period ?? getCurrentPeriod(periods);
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;
  const savedState = sp?.saved ? true : false;

  const { tasks: allTasks } = await loadFinanceTasks(selectedPeriod);
  const tasks = allTasks.filter((t) => t.owner.trim().toLowerCase() === owner.trim().toLowerCase());

  const today = new Date().toISOString().slice(0, 10);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const active = tasks.filter((t) => !["Completed", "Failed"].includes(t.status)).length;
  const failed = tasks.filter((t) => t.status === "Failed").length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && !["Completed", "Failed"].includes(t.status)).length;
  const avgProgress = total ? Math.round(tasks.reduce((s, t) => s + t.progressPercent, 0) / total) : 0;

  const sorted = [...tasks].sort((a, b) => {
    const aActive = !["Completed", "Failed"].includes(a.status) ? 0 : 1;
    const bActive = !["Completed", "Failed"].includes(b.status) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Finance Tasks · Owner Detail</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{owner}</h1>
            <p className="mt-3 text-sm text-slate-400">All tasks for this position — {periodLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form method="get" className="flex items-center gap-2">
              <select name="period" defaultValue={selectedPeriod}
                className="h-10 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none">
                {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
              </select>
              <button type="submit" className="h-10 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300">Apply</button>
            </form>
            <Link href={`/finance/tasks?period=${selectedPeriod}`}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Finance Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total",        value: total,            color: "text-slate-900" },
          { label: "Active",       value: active,           color: "text-sky-600" },
          { label: "Completed",    value: completed,        color: "text-emerald-600" },
          { label: "Failed",       value: failed,           color: "text-rose-600" },
          { label: "Overdue",      value: overdue,          color: overdue > 0 ? "text-rose-600" : "text-slate-900" },
          { label: "Avg Progress", value: `${avgProgress}%`, color: "text-slate-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Save banner */}
      {savedState && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-panel">
          <p className="text-sm font-semibold text-emerald-900">Task updated successfully.</p>
        </section>
      )}

      {/* Task list */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Tasks — {owner}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {total > 0 ? `${total} task${total !== 1 ? "s" : ""} for ${periodLabel}.` : `No tasks logged for ${periodLabel}.`}
            </p>
          </div>
        </div>

        {total === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm text-slate-400">
            No tasks found for this owner in {periodLabel}.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {sorted.map((task) => (
              <div key={task.id} className={`rounded-2xl border p-5 ${toneClass(task.status)}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Requested by: <span className="font-medium">{task.requester}</span>
                      {task.dueDate && <span className="ml-3">Due: <span className={`font-medium ${task.dueDate < today && !["Completed","Failed"].includes(task.status) ? "text-rose-600" : "text-slate-700"}`}>{task.dueDate}</span></span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${priorityClass(task.priority)}`}>{task.priority}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${toneClass(task.status)}`}>{task.status}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700">{task.progressPercent}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
                    <div className="h-full rounded-full bg-current opacity-50 transition-all" style={{ width: `${task.progressPercent}%` }} />
                  </div>
                </div>

                {task.notes && (
                  <p className="mt-2 text-xs text-slate-600 italic">&ldquo;{task.notes}&rdquo;</p>
                )}

                <form action={updateFinanceTaskAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-current/10 pt-4">
                  <input type="hidden" name="task_id" value={task.id} />
                  <input type="hidden" name="file_link" value={task.fileLink ?? ""} />
                  <input type="hidden" name="redirect_to" value={`/finance/tasks/owner/${encodeURIComponent(owner)}`} />
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
                    <select name="status" defaultValue={task.status}
                      className="mt-1 h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-sky-400">
                      {FINANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Progress %</span>
                    <input type="number" name="progress_percent" defaultValue={task.progressPercent} min={0} max={100}
                      className="mt-1 h-9 w-20 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-sky-400" />
                  </label>
                  <label className="block flex-1 min-w-[160px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Note</span>
                    <input name="result_note" defaultValue={task.notes}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-sky-400" />
                  </label>
                  <button type="submit"
                    className="h-9 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white hover:bg-slate-800">
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
