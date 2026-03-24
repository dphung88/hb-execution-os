import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckSquare, Megaphone } from "lucide-react";

import {
  marketingChannelSetup,
  marketingHeadcountPlan,
  marketingResultsTracker,
  marketingWorkbookContext,
} from "@/lib/demo-data";
import { getMarketingTeamExecutionSummary } from "@/lib/marketing/execution";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

import { marketingToneClass as toneClass } from "./marketing-shared";

type MarketingTeamHubProps = {
  tasks?: MarketingTaskRecord[];
};

export function MarketingTeamHub({ tasks = [] }: MarketingTeamHubProps) {
  const executionSummary = getMarketingTeamExecutionSummary(tasks);
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Marketing Team</p>
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
                href="/marketing-performance"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Dashboard overview
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Sales revenue target", value: `${marketingWorkbookContext.salesRevenueTarget}M` },
              { label: "Actual sales revenue", value: `${marketingWorkbookContext.actualSalesRevenue}M` },
              { label: "Expense budget", value: `${marketingWorkbookContext.actualExpenseBudget}M / ${marketingWorkbookContext.expenseBudgetTarget}M` },
              { label: "Headcount setup", value: `${marketingWorkbookContext.headcountActual}/${marketingWorkbookContext.headcountPlanned}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue gap",
            value: `${(marketingWorkbookContext.salesRevenueTarget - marketingWorkbookContext.actualSalesRevenue).toFixed(0)}M`,
            note: "Target vs actual sales revenue",
          },
          {
            label: "Budget remaining",
            value: `${(marketingWorkbookContext.expenseBudgetTarget - marketingWorkbookContext.actualExpenseBudget).toFixed(1)}M`,
            note: "Remaining budget from dashboard sheet",
          },
          {
            label: "Roles on track",
            value: `${marketingHeadcountPlan.filter((role) => role.remaining >= 0).length}/${marketingHeadcountPlan.length}`,
            note: "Headcount rows with no negative gap",
          },
          {
            label: "Open marketing tasks",
            value: `${tasks.filter((task) => task.status !== "Completed").length}`,
            note: `Execution score average ${executionSummary.averageExecutionScore}/40`,
          },
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
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">KPI setup</p>
            <h2 className="text-2xl font-semibold text-slate-900">Headcount and ownership plan</h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <div className="min-w-[720px]">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Estimated</th>
                  <th className="px-4 py-4 font-medium">Actual</th>
                  <th className="px-4 py-4 font-medium">Remaining</th>
                  <th className="px-4 py-4 font-medium">Owner slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {marketingHeadcountPlan.map((row) => (
                  <tr key={row.role}>
                    <td className="px-4 py-4 font-medium text-slate-900">{row.role}</td>
                    <td className="px-4 py-4 text-slate-700">{row.estimated}</td>
                    <td className="px-4 py-4 text-slate-700">{row.actual}</td>
                    <td className={`px-4 py-4 font-medium ${row.remaining < 0 ? "text-rose-700" : "text-slate-700"}`}>
                      {row.remaining}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.owner || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Results</p>
              <h2 className="text-2xl font-semibold text-slate-900">Monthly KPI results by role</h2>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
            <div className="min-w-[760px]">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-medium">Owner</th>
                    <th className="px-4 py-4 font-medium">Metric</th>
                    <th className="px-4 py-4 font-medium">Estimated</th>
                    <th className="px-4 py-4 font-medium">Actual</th>
                    <th className="px-4 py-4 font-medium">Remaining</th>
                    <th className="px-4 py-4 font-medium">KPI unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {marketingResultsTracker.map((row) => (
                    <tr key={`${row.owner}-${row.metric}`}>
                      <td className="px-4 py-4 font-medium text-slate-900">{row.owner}</td>
                      <td className="px-4 py-4 text-slate-700">{row.metric}</td>
                      <td className="px-4 py-4 text-slate-700">{row.estimated}M</td>
                      <td className="px-4 py-4 text-slate-700">{row.actual}M</td>
                      <td className="px-4 py-4 text-slate-700">{row.remaining}M</td>
                      <td className="px-4 py-4 text-slate-700">{row.kpiUnit.toFixed(2)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <h2 className="text-2xl font-semibold text-slate-900">Budget mix from dashboard</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {marketingChannelSetup.map((channel) => (
              <div key={channel.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{channel.channel}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {(channel.actualRatio * 100).toFixed(1)}% actual ratio
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Budget {channel.budget}M · Actual {channel.actualBudget}M · Remaining {channel.remainingBudget}M
                </p>
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

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
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
      </section>
    </div>
  );
}
