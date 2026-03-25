import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckSquare, LayoutDashboard, Megaphone, Sparkles, Users, WandSparkles } from "lucide-react";

import {
  marketingChannelSetup,
  marketingHeadcountPlan,
  marketingReportSummary,
} from "@/lib/demo-data";
import { getMarketingTeamExecutionSummary } from "@/lib/marketing/execution";
import { marketingRoleTemplates } from "@/lib/marketing/kpi-templates";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

import { marketingToneClass as toneClass } from "./marketing-shared";

type MarketingTeamHubProps = {
  tasks?: MarketingTaskRecord[];
};

export function MarketingTeamHub({ tasks = [] }: MarketingTeamHubProps) {
  const executionSummary = getMarketingTeamExecutionSummary(tasks);
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";
  const actionCardClass =
    "group flex min-h-[84px] items-center gap-3 rounded-3xl border px-4 py-4 text-left transition";
  const actionIconClass = "rounded-2xl p-3";
  const roleSummaries = marketingHeadcountPlan.map((role) => {
    const template = marketingRoleTemplates.find((item) => item.role === role.role);
    const taskRows = tasks.filter((task) => task.owner === role.role);
    const execution = executionSummary.owners.find((row) => row.owner === role.role);
    const metricCount = template?.sections.reduce((sum, section) => sum + section.metrics.length, 0) ?? 0;

    return {
      role: role.role,
      focus:
        role.role === "Digital Marketer" || role.role === "E-Com Operations"
          ? "Revenue-driving"
          : role.role === "Senior Manager"
            ? "Leadership"
            : "Support",
      estimated: role.estimated,
      actual: role.actual,
      remaining: role.remaining,
      metricCount,
      taskCount: taskRows.length,
      executionScore: execution?.executionScore ?? 0,
      openTasks: taskRows.filter((task) => task.status !== "Done").length,
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className={heroLabelClass}>Marketing Team</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Marketing execution, KPI ownership, and department results.
            </h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/marketing-performance/tasks"
                className={`${actionCardClass} border-sky-200 bg-sky-50 text-slate-950 hover:border-sky-300 hover:bg-sky-100`}
              >
                <span className={`${actionIconClass} bg-sky-100 text-sky-700`}>
                  <CheckSquare className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold">Open Marketing Tasks</span>
              </Link>
              <Link
                href="/marketing-performance/results"
                className={`${actionCardClass} border-violet-200 bg-violet-50 text-slate-950 hover:border-violet-300 hover:bg-violet-100`}
              >
                <span className={`${actionIconClass} bg-violet-100 text-violet-700`}>
                  <BarChart3 className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold">Open Marketing Results</span>
              </Link>
              <Link
                href="/marketing-performance/targets"
                className={`${actionCardClass} border-amber-200 bg-amber-50 text-slate-950 hover:border-amber-300 hover:bg-amber-100`}
              >
                <span className={`${actionIconClass} bg-amber-100 text-amber-700`}>
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold">Open Marketing Targets</span>
              </Link>
              <Link
                href="/marketing-performance"
                className={`${actionCardClass} border-emerald-200 bg-emerald-50 text-slate-950 hover:border-emerald-300 hover:bg-emerald-100`}
              >
                <span className={`${actionIconClass} bg-emerald-100 text-emerald-700`}>
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold">Dashboard Overview</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Sales revenue", value: `${marketingReportSummary.actualOnlineSales}M / ${marketingReportSummary.salesRevenueTarget}M` },
              { label: "Actual AOV", value: `${marketingReportSummary.averageOrderValue.toFixed(2)}M` },
              { label: "Total ad spend", value: `${marketingReportSummary.totalAdSpend}M` },
              { label: "Total PO", value: `${marketingReportSummary.totalPurchaseOrders}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className={darkCardLabelClass}>{item.label}</p>
                <p className={darkCardValueClass}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-700">Channel Setup</p>
            <h2 className="text-2xl font-semibold text-slate-900">Budget Mix by Channel</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {marketingChannelSetup.map((channel) => (
            <div key={channel.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{channel.channel}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {(channel.actualRatio * 100).toFixed(1)}% actual ratio
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Actual spend {channel.actualBudget}M
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
          <div>
            <p className="text-sm font-semibold text-brand-700">Results</p>
            <h2 className="text-2xl font-semibold text-slate-900">Role Summary Across the Department</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleSummaries.map((role) => (
            <div
              key={role.role}
              className={`rounded-3xl border p-5 ${
                role.focus === "Revenue-driving"
                  ? "border-sky-200 bg-sky-50/60"
                  : role.focus === "Leadership"
                    ? "border-violet-200 bg-violet-50/60"
                    : "border-amber-200 bg-amber-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-2xl p-3 ${
                      role.focus === "Revenue-driving"
                        ? "bg-sky-100 text-sky-700"
                        : role.focus === "Leadership"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {role.focus === "Revenue-driving" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : role.focus === "Leadership" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <WandSparkles className="h-5 w-5" />
                    )}
                  </div>
                  <p className="truncate text-base font-semibold text-slate-900" title={role.role}>
                    {role.role}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {role.executionScore}/40 execution
                </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Headcount</p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {role.actual}/{role.estimated}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Remaining</p>
                    <p className={`mt-2 font-semibold ${role.remaining < 0 ? "text-rose-700" : "text-slate-900"}`}>
                      {role.remaining}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">KPI Metrics</p>
                    <p className="mt-2 font-semibold text-slate-900">{role.metricCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Open Tasks</p>
                    <p className="mt-2 font-semibold text-slate-900">{role.openTasks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-700">Task Tracking</p>
            <h2 className="text-2xl font-semibold text-slate-900">Workbook Task Pipeline by Marketing Role</h2>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200">
          <div className="divide-y divide-slate-100 bg-white md:hidden">
            {tasks.map((task) => (
              <div key={task.id} className="space-y-3 px-4 py-4">
                <p className="text-base font-semibold text-slate-900">{task.owner}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Requester</p>
                    <p className="mt-1 text-slate-700">{task.requester}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Due date</p>
                    <p className="mt-1 text-slate-700">{task.dueDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</p>
                    <p className="mt-1 text-slate-600">{task.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[760px]">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-medium">Owner</th>
                    <th className="px-4 py-4 font-medium">Requester</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Due date</th>
                    <th className="px-4 py-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{task.owner}</td>
                      <td className="px-4 py-4 text-slate-700">{task.requester}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass(task.status)}`}>
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
        </div>
      </section>
    </div>
  );
}
