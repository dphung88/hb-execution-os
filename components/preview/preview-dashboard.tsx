import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileStack,
  ShieldAlert,
  Sparkles
} from "lucide-react";

import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import {
  demoExecutiveBrief,
  demoKpis,
  demoNotifications,
  demoSignals,
  demoStats,
  demoStreams,
  demoTasks,
  demoTimeline
} from "@/lib/demo-data";

function MiniTrend({ values }: { values: number[] }) {
  const width = 220;
  const height = 80;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full">
      <defs>
        <linearGradient id="trendFill" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(47,134,246,0.28)" />
          <stop offset="100%" stopColor="rgba(47,134,246,0.02)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#2f86f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon fill="url(#trendFill)" points={`0,${height} ${points} ${width},${height}`} />
    </svg>
  );
}

export function PreviewDashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
              Executive Preview
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
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
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">VP / COO dashboard</p>
              <h2 className="text-2xl font-semibold text-slate-900">Execution Pulse</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoSignals.map((signal) => (
              <div key={signal.label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {signal.label}
                </p>
                <p className="mt-3 text-base font-semibold text-slate-900">{signal.value}</p>
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
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Leadership timeline</p>
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
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <ChartNoAxesCombined className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">KPI command center</p>
              <h2 className="text-2xl font-semibold text-slate-900">Trend Watch</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {demoKpis.map((kpi) => (
              <div key={kpi.name} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{kpi.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{kpi.target}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {kpi.status}
                  </span>
                </div>
                <div className="mt-4">
                  <MiniTrend values={kpi.trend} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Notification stack</p>
              <h2 className="text-2xl font-semibold text-slate-900">Leadership Alerts</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {demoNotifications.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item.tone}
                  </span>
                </div>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Execution queue</p>
              <h2 className="text-2xl font-semibold text-slate-900">Priority Tasks</h2>
            </div>
          </div>

          <TaskList tasks={demoTasks} />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <FileStack className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">CEO presentation workflow</p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {demoExecutiveBrief.title}
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-sky-300">{demoExecutiveBrief.readiness}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  1 minute brief
                </span>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-200">
                {demoExecutiveBrief.summary}
              </p>
              <div className="mt-5 space-y-3">
                {demoExecutiveBrief.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {bullet}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">What Phase 1 shows</p>
              <h2 className="text-2xl font-semibold text-slate-900">Visual Product Story</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              This demo layer now shows the actual product narrative: KPI movement, urgent
              alerts, a CEO-ready brief card, and departmental operating signals.
            </p>
            <div className="grid gap-3">
              {demoStreams.map((stream) => (
                <div key={stream.team} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{stream.team}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {stream.metric}
                    </span>
                  </div>
                  <p className="mt-3 font-medium text-slate-800">{stream.headline}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{stream.body}</p>
                </div>
              ))}
            </div>
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
