import Link from "next/link";
import { ArrowRight, BellRing, FileStack, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  demoDepartmentBoards,
  demoExecutiveBrief,
  demoMeetingInsight,
  demoNotifications
} from "@/lib/demo-data";
import { getDashboardStats, getTaskList } from "@/lib/tasks/queries";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, tasks] = await Promise.all([getDashboardStats(), getTaskList()]);
  const upcomingTasks = tasks.filter((task) => task.status !== "done").slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total tasks", value: stats.totalTasks },
          { label: "Open tasks", value: stats.openTasks },
          { label: "Blocked tasks", value: stats.blockedTasks },
          { label: "Critical tasks", value: stats.criticalTasks }
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-panel sm:p-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 sm:mt-3 sm:text-3xl">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Execution pulse</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                Focus Areas This Week
              </h2>
            </div>
            <Link href="/tasks">
              <Button variant="secondary" className="gap-2">
                View all tasks
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/tasks/${task.id}`} className="font-medium text-slate-900">
                        {task.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {task.owner_name || task.owner_email || "Unknown owner"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(task.due_date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No open tasks yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Phase 1 scope</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            What This Release Includes
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>Supabase-authenticated app shell with protected routes</li>
            <li>Dashboard metrics sourced from task data</li>
            <li>Task list, task create flow, and task detail page</li>
            <li>SQL migration and environment setup for local and prod parity</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Notification center</p>
              <h2 className="text-2xl font-semibold text-slate-900">Leadership Queue</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {demoNotifications.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item.tone}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
              <FileStack className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">CEO brief</p>
              <h2 className="text-2xl font-semibold text-slate-900">{demoExecutiveBrief.title}</h2>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">{demoExecutiveBrief.summary}</p>
          <Link href="/briefs" className="mt-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            Open brief workspace
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Meeting intelligence</p>
              <h2 className="text-2xl font-semibold text-slate-900">{demoMeetingInsight.title}</h2>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">{demoMeetingInsight.summary}</p>
          <Link href="/meetings" className="mt-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            Open meeting workspace
          </Link>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Department boards</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Operating View By Function</h2>

          <div className="mt-6 grid gap-4">
            {demoDepartmentBoards.map((board) => (
              <div key={board.name} className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{board.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{board.owner}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {board.health}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{board.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
