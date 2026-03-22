import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDashboardStats, getTaskList } from "@/lib/tasks/queries";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, tasks] = await Promise.all([getDashboardStats(), getTaskList()]);
  const upcomingTasks = tasks.filter((task) => task.status !== "done").slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total tasks", value: stats.totalTasks },
          { label: "Open tasks", value: stats.openTasks },
          { label: "Blocked tasks", value: stats.blockedTasks },
          { label: "Critical tasks", value: stats.criticalTasks }
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-brand-700">Execution pulse</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                Focus areas this week
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
          <p className="text-sm font-medium text-brand-700">Phase 1 scope</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            What this release includes
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>Supabase-authenticated app shell with protected routes</li>
            <li>Dashboard metrics sourced from task data</li>
            <li>Task list, task create flow, and task detail page</li>
            <li>SQL migration and environment setup for local and prod parity</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
