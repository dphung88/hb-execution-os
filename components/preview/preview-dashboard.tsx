import Link from "next/link";
import { ArrowRight, BellRing, BriefcaseBusiness, ChartNoAxesCombined, Sparkles } from "lucide-react";

import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { demoSignals, demoStats, demoTasks, demoTimeline } from "@/lib/demo-data";

export function PreviewDashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              Executive Preview
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              One operating system for revenue, execution, and CEO readiness.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              This is the public preview layer for HB Execution OS. It shows the kind of
              leadership cockpit you will eventually run with real team data, live tasks,
              alerts, and executive briefings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button className="gap-2">
                Open live app
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="secondary">Task module</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {demoStats.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <ChartNoAxesCombined className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">VP / COO dashboard</p>
              <h2 className="text-2xl font-semibold text-slate-900">Execution pulse</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoSignals.map((signal) => (
              <div key={signal.label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {signal.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{signal.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Leadership timeline</p>
              <h2 className="text-2xl font-semibold text-slate-900">Today</h2>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {demoTimeline.map((item) => (
              <div key={item.time} className="border-l-2 border-slate-200 pl-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                  {item.time}
                </p>
                <p className="mt-1 font-medium text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Execution queue</p>
              <h2 className="text-2xl font-semibold text-slate-900">Priority tasks</h2>
            </div>
          </div>

          <TaskList tasks={demoTasks} />
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">What Phase 1 shows</p>
              <h2 className="text-2xl font-semibold text-slate-900">Visual product story</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              The public preview gives you a tangible picture of the eventual executive
              operating system: one place to see strategic priorities, execution drift,
              task ownership, and the queue of items that need leadership attention.
            </p>
            <p>
              The authenticated app remains the real working layer. As we add notifications,
              meeting intelligence, and CEO brief workflows, this preview can evolve into a
              real stakeholder-facing front door.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <Link href="/preview">
              <Button className="w-full justify-between">
                Open preview mode
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full justify-between">
                Open secure workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
