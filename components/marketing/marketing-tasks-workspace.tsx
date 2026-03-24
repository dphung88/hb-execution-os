import Link from "next/link";
import { CalendarDays, CheckSquare, Filter, FolderKanban, TimerReset } from "lucide-react";

import { marketingTaskTracker } from "@/lib/demo-data";

import { marketingToneClass } from "./marketing-shared";

type MarketingTasksWorkspaceProps = {
  searchParams?: {
    owner?: string;
    status?: string;
    requester?: string;
  };
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function MarketingTasksWorkspace({ searchParams }: MarketingTasksWorkspaceProps) {
  const ownerFilter = searchParams?.owner ?? "all";
  const statusFilter = searchParams?.status ?? "all";
  const requesterFilter = searchParams?.requester ?? "all";

  const owners = Array.from(new Set(marketingTaskTracker.map((task) => task.owner))).sort();
  const statuses = Array.from(new Set(marketingTaskTracker.map((task) => task.status))).sort();
  const requesters = Array.from(new Set(marketingTaskTracker.map((task) => task.requester))).sort();

  const filteredTasks = marketingTaskTracker.filter((task) => {
    const ownerMatches = ownerFilter === "all" || normalize(task.owner) === normalize(ownerFilter);
    const statusMatches = statusFilter === "all" || normalize(task.status) === normalize(statusFilter);
    const requesterMatches = requesterFilter === "all" || normalize(task.requester) === normalize(requesterFilter);
    return ownerMatches && statusMatches && requesterMatches;
  });

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
        existing.progressRaw += 0;
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
              This page turns the executive task tracker into one working board for owners, requesters,
              deadlines, and delivery notes. The goal is simple: track each person clearly, then feed
              execution back into monthly KPI scoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/marketing-performance"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Back to Marketing Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Filtered tasks", value: String(filteredTasks.length), note: "Current task view" },
          { label: "Active tasks", value: String(activeTasks.length), note: "Not completed or failed" },
          { label: "Overdue tasks", value: String(overdueTasks.length), note: "Past due and still open" },
          { label: "Requester lanes", value: String(reviewerGroups.length), note: "Boss, Manager, Colleague" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
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

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">TASK BOARD</p>
              <h2 className="text-2xl font-semibold text-slate-900">Execution tracker by owner</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Owner</th>
                  <th className="px-4 py-4 font-medium">Requester</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Due date</th>
                  <th className="px-4 py-4 font-medium">Result note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTasks.map((task) => (
                  <tr key={`${task.owner}-${task.dueDate}-${task.status}-${task.requester}`}>
                    <td className="px-4 py-4 font-medium text-slate-900">{task.owner}</td>
                    <td className="px-4 py-4 text-slate-700">{task.requester}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${marketingToneClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{task.dueDate}</td>
                    <td className="px-4 py-4 text-slate-600">{task.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
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
                  <p className="mt-2 text-sm text-slate-500">
                    Active {row.active} · Completed {row.completed}
                  </p>
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
