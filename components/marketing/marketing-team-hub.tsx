import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckSquare, Megaphone } from "lucide-react";

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
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className={heroLabelClass}>Marketing Team</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Marketing execution, KPI ownership, and department results.
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/marketing-performance/tasks"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Open Marketing Tasks
              </Link>
            <Link
              href="/marketing-performance/results"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Open Marketing Results
            </Link>
            <Link
              href="/marketing-performance/targets"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Open Marketing Targets
            </Link>
            <Link
              href="/marketing-performance"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
                Dashboard overview
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

      <section className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">KPI setup</p>
              <h2 className="text-2xl font-semibold text-slate-900">Headcount plan</h2>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200">
            <div className="divide-y divide-slate-100 bg-white md:hidden">
              {marketingHeadcountPlan.map((row) => (
                <div key={row.role} className="space-y-2 px-4 py-3.5">
                  <p className="text-[15px] font-semibold text-slate-900">{row.role}</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Estimated</p>
                      <p className="mt-1 text-slate-700">{row.estimated}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Actual</p>
                      <p className="mt-1 text-slate-700">{row.actual}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Remaining</p>
                      <p className={`mt-1 ${row.remaining < 0 ? "text-rose-700" : "text-slate-700"}`}>{row.remaining}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[520px]">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-3 py-3 font-medium">Estimated</th>
                      <th className="px-3 py-3 font-medium">Actual</th>
                      <th className="px-3 py-3 font-medium">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {marketingHeadcountPlan.map((row) => (
                      <tr key={row.role}>
                        <td className="px-4 py-3.5 font-medium text-slate-900">{row.role}</td>
                        <td className="px-3 py-3.5 text-slate-700">{row.estimated}</td>
                        <td className="px-3 py-3.5 text-slate-700">{row.actual}</td>
                        <td className={`px-3 py-3.5 font-medium ${row.remaining < 0 ? "text-rose-700" : "text-slate-700"}`}>
                          {row.remaining}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Channel setup</p>
              <h2 className="text-2xl font-semibold text-slate-900">Budget mix by channel</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
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
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Results</p>
              <h2 className="text-2xl font-semibold text-slate-900">Role summary across the department</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roleSummaries.map((role) => (
              <div key={role.role} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{role.role}</p>
                    <p className="mt-1 text-sm text-slate-500">{role.focus}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Execution {role.executionScore}/40
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Headcount</p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {role.actual}/{role.estimated}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Remaining</p>
                    <p className={`mt-2 font-semibold ${role.remaining < 0 ? "text-rose-700" : "text-slate-900"}`}>
                      {role.remaining}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tracked KPIs</p>
                    <p className="mt-2 font-semibold text-slate-900">{role.metricCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Task load</p>
                    <p className="mt-2 font-semibold text-slate-900">{role.taskCount}</p>
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
            <p className="text-sm font-medium text-brand-700">Task tracking</p>
            <h2 className="text-2xl font-semibold text-slate-900">Workbook task pipeline by marketing role</h2>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200">
          <div className="divide-y divide-slate-100 bg-white md:hidden">
            {tasks.map((task) => (
              <div key={task.id} className="space-y-3 px-4 py-4">
                <p className="text-base font-semibold text-slate-900">{task.owner}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Requester</p>
                    <p className="mt-1 text-slate-700">{task.requester}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Due date</p>
                    <p className="mt-1 text-slate-700">{task.dueDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Notes</p>
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
