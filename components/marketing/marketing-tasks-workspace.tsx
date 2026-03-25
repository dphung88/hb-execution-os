import Link from "next/link";
import { CalendarDays, CheckSquare, Filter, FolderKanban, TimerReset } from "lucide-react";

import { createMarketingTaskAction, updateMarketingTaskAction } from "@/app/(app)/marketing-performance/tasks/actions";
import { marketingWorkbookContext } from "@/lib/demo-data";
import { getMarketingExecutionScore } from "@/lib/marketing/execution";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

import { marketingToneClass } from "./marketing-shared";

type MarketingTasksWorkspaceProps = {
  tasks: MarketingTaskRecord[];
  source: "live" | "demo";
  searchParams?: {
    owner?: string;
    status?: string;
    requester?: string;
    saved?: string;
    error?: string;
  };
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function MarketingTasksWorkspace({ tasks, source, searchParams }: MarketingTasksWorkspaceProps) {
  const ownerFilter = searchParams?.owner ?? "all";
  const statusFilter = searchParams?.status ?? "all";
  const requesterFilter = searchParams?.requester ?? "all";
  const savedState = searchParams?.saved;
  const errorState = searchParams?.error;

  const owners = Array.from(new Set(tasks.map((task) => task.owner))).sort();
  const statuses = Array.from(new Set(tasks.map((task) => task.status))).sort();
  const requesters = Array.from(new Set(tasks.map((task) => task.requester))).sort();

  const filteredTasks = tasks.filter((task) => {
    const ownerMatches = ownerFilter === "all" || normalize(task.owner) === normalize(ownerFilter);
    const statusMatches = statusFilter === "all" || normalize(task.status) === normalize(statusFilter);
    const requesterMatches = requesterFilter === "all" || normalize(task.requester) === normalize(requesterFilter);
    return ownerMatches && statusMatches && requesterMatches;
  });

  const plannedTasks = filteredTasks.filter((task) => normalize(task.status) === "planned").length;
  const inProgressTasks = filteredTasks.filter((task) => normalize(task.status) === "in progress").length;
  const notStartedTasks = filteredTasks.filter((task) => normalize(task.status) === "not started").length;
  const failedTasks = filteredTasks.filter((task) => normalize(task.status) === "failed").length;
  const overdueTasks = filteredTasks.filter((task) => new Date(task.dueDate) < new Date("2025-03-20") && task.status !== "Completed");
  const activeTasks = filteredTasks.filter((task) => !["Completed", "Failed"].includes(task.status));
  const reviewerGroups = Array.from(
    filteredTasks.reduce((map, task) => {
      const key = task.requester;
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
      return map;
    }, new Map<string, typeof filteredTasks>())
  );

  const workloadRows = Array.from(
    filteredTasks
      .reduce((map, task) => {
        const existing = map.get(task.owner) ?? {
          owner: task.owner,
          total: 0,
          active: 0,
          completed: 0,
          avgProgress: 0,
          progressRaw: 0,
        };
        existing.total += 1;
        if (!["Completed", "Failed"].includes(task.status)) existing.active += 1;
        if (task.status === "Completed") existing.completed += 1;
        existing.progressRaw += task.progressPercent;
        map.set(task.owner, existing);
        return map;
      }, new Map<string, { owner: string; total: number; active: number; completed: number; avgProgress: number; progressRaw: number }>())
      .values()
  ).map((row) => ({ ...row, avgProgress: row.total ? Math.round(row.progressRaw / row.total) : 0 }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Marketing Tasks</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Daily task workspace for the Marketing team.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
      Create and update Marketing tasks in one place, then let completion quality feed directly into KPI execution scoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/marketing-performance/results"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Back to Results
            </Link>
            <Link
              href="/marketing-performance/results"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open Marketing Results
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Planned", value: String(plannedTasks), note: "Queued for execution" },
          { label: "In progress", value: String(inProgressTasks), note: "Currently being worked" },
          { label: "Not started", value: String(notStartedTasks), note: "Assigned but untouched" },
          { label: "Failed", value: String(failedTasks), note: "Tasks needing reset" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      {savedState ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-emerald-900">Task saved</p>
          <p className="mt-2 text-sm text-emerald-800">
            {savedState === "create" ? "A new Marketing task has been created." : "The Marketing task update has been saved."}
          </p>
        </section>
      ) : null}

      {errorState ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Task save failed</p>
          <p className="mt-2 text-sm text-rose-800">
            {errorState === "missing-table"
              ? "Supabase is missing the marketing_tasks table or required columns."
              : errorState === "rls-blocked"
                ? "Supabase row-level security is still blocking Marketing task writes."
                : "The write connection is not ready yet for Marketing tasks."}
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">NEW TASK</p>
            <h2 className="text-2xl font-semibold text-slate-900">Create a Marketing task directly on the web</h2>
          </div>
        </div>

        <form action={createMarketingTaskAction} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input type="hidden" name="month_key" value={marketingWorkbookContext.monthKey} />

          <label className="block xl:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Task name</span>
            <input name="task_name" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Owner</span>
            <select name="owner_name" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Requester</span>
            <select name="request_source" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {requesters.map((requester) => <option key={requester} value={requester}>{requester}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</span>
            <select name="status" defaultValue="Planned" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Priority</span>
            <select name="priority" defaultValue="Medium" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400">
              {["Low", "Medium", "High", "Critical"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Due date</span>
            <input type="date" name="due_date" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Progress %</span>
            <input type="number" name="progress_percent" defaultValue={0} min={0} max={100} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block xl:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Result note</span>
            <input name="result_note" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">File link</span>
            <input name="file_link" className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400" />
          </label>
          <div className="xl:col-span-3 flex justify-end">
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Create task
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">TASK FILTERS</p>
            <h2 className="text-2xl font-semibold text-slate-900">Slice the Marketing task queue by owner and status</h2>
          </div>
        </div>

        <form method="get" className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr,1fr,1fr,140px]">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Owner</span>
            <select
              name="owner"
              defaultValue={ownerFilter}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
            >
              <option value="all">All owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Requester</span>
            <select
              name="requester"
              defaultValue={requesterFilter}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
            >
              <option value="all">All requesters</option>
              {requesters.map((requester) => (
                <option key={requester} value={requester}>
                  {requester}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-[1.55rem] inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">TASK BOARD</p>
                <h2 className="text-2xl font-semibold text-slate-900">Execution tracker by owner</h2>
              </div>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                source === "live" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {source === "live" ? "LIVE TASK SOURCE" : "DEMO TASK SOURCE"}
            </span>
          </div>

            <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white md:overflow-hidden">
              <div className="min-w-[980px] md:min-w-0">
                <div className="grid grid-cols-[minmax(240px,1.25fr)_minmax(140px,0.7fr)_minmax(130px,0.55fr)_minmax(130px,0.55fr)_minmax(220px,1fr)_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid-cols-[minmax(160px,1fr)_minmax(112px,0.62fr)_100px_96px_minmax(160px,0.92fr)_84px] md:gap-3 md:px-4 md:text-[11px] md:tracking-[0.12em] xl:grid-cols-[minmax(190px,1.08fr)_minmax(126px,0.68fr)_110px_104px_minmax(180px,0.96fr)_92px] xl:gap-4 xl:px-5 xl:text-xs">
                <div>Task</div>
                <div>Status</div>
                <div>Due date</div>
                <div>Progress</div>
                <div>Result note</div>
                <div className="text-right">Action</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <form
                    key={task.id}
                    action={updateMarketingTaskAction}
                    className="grid grid-cols-[minmax(240px,1.25fr)_minmax(140px,0.7fr)_minmax(130px,0.55fr)_minmax(130px,0.55fr)_minmax(220px,1fr)_120px] items-start gap-4 px-5 py-4 md:grid-cols-[minmax(160px,1fr)_minmax(112px,0.62fr)_100px_96px_minmax(160px,0.92fr)_84px] md:gap-3 md:px-4 xl:grid-cols-[minmax(190px,1.08fr)_minmax(126px,0.68fr)_110px_104px_minmax(180px,0.96fr)_92px] xl:gap-4 xl:px-5"
                  >
                    <input type="hidden" name="task_id" value={task.id} />
                    <input type="hidden" name="file_link" value={task.fileLink ?? ""} />

                    <div>
                      <p className="text-sm font-semibold leading-6 text-slate-900 md:text-[12px] md:leading-5">{task.title}</p>
                      <p className="mt-2 text-sm text-slate-600 md:text-[12px]">
                        {task.owner} · {task.requester}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 md:px-2 md:py-0.5 md:text-[10px]">
                          Priority {task.priority}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold md:px-2 md:py-0.5 md:text-[10px] ${marketingToneClass(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <select
                        name="status"
                        defaultValue={task.status}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 md:h-9 md:px-2.5 md:text-[12px]"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 text-sm text-slate-700 md:text-[12px]">{task.dueDate || "-"}</div>

                    <div>
                      <input
                        type="number"
                        name="progress_percent"
                        defaultValue={task.progressPercent}
                        min={0}
                        max={100}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 md:h-9 md:px-2.5 md:text-[12px]"
                      />
                    </div>

                    <div>
                      <input
                        name="result_note"
                        defaultValue={task.notes}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 md:h-9 md:px-2.5 md:text-[12px]"
                      />
                      <p className="mt-2 text-xs text-slate-500 md:text-[10px]">{task.fileLink ? "File link attached" : "No file link yet"}</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 md:h-9 md:px-3 md:text-[12px]"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ))}

                {!filteredTasks.length ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">No Marketing tasks matched the current filters.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <TimerReset className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">OVERDUE WATCH</p>
                <h2 className="text-2xl font-semibold text-slate-900">Tasks needing intervention</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {overdueTasks.length ? (
                overdueTasks.map((task) => (
                  <div key={`${task.owner}-${task.dueDate}`} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                    <p className="font-medium text-rose-900">{task.owner}</p>
                    <p className="mt-1 text-sm text-rose-700">
                      {task.status} · Due {task.dueDate}
                    </p>
                    <p className="mt-2 text-sm text-rose-800">{task.notes}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  No overdue tasks in the current filtered view.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">WORKLOAD</p>
                <h2 className="text-2xl font-semibold text-slate-900">Task count by owner</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {workloadRows.map((row) => (
                <div key={row.owner} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{row.owner}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {row.total} task{row.total > 1 ? "s" : ""}
                    </span>
                  </div>
                  {(() => {
                    const execution = getMarketingExecutionScore(row.owner, filteredTasks);
                    return (
                      <p className="mt-2 text-sm text-slate-500">
                        Active {row.active} · Completed {row.completed} · Avg progress {row.avgProgress}% · Execution {execution.executionScore}/40
                      </p>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">REQUEST LANES</p>
                <h2 className="text-2xl font-semibold text-slate-900">Task queue by requester</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {reviewerGroups.map(([requester, tasks]) => (
                <div key={requester} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{requester}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {tasks.length} item{tasks.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tasks.map((task) => (
                      <span
                        key={`${requester}-${task.owner}-${task.dueDate}`}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${marketingToneClass(task.status)}`}
                      >
                        {task.owner} · {task.status}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
