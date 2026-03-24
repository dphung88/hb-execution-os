import Link from "next/link";
import { BarChart3, BriefcaseBusiness, Megaphone, TrendingUp } from "lucide-react";

import {
  marketingChannelSetup,
  marketingHeadcountPlan,
  marketingResultsTracker,
  marketingWorkbookContext,
} from "@/lib/demo-data";

function toPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

export function MarketingResultsWorkspace() {
  const revenueGap = marketingWorkbookContext.salesRevenueTarget - marketingWorkbookContext.actualSalesRevenue;
  const budgetRemaining = marketingWorkbookContext.expenseBudgetTarget - marketingWorkbookContext.actualExpenseBudget;
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const lightCardLabelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";
  const groupedResults = Array.from(
    marketingResultsTracker.reduce((map, row) => {
      const list = map.get(row.owner) ?? [];
      list.push(row);
      map.set(row.owner, list);
      return map;
    }, new Map<string, typeof marketingResultsTracker>())
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className={heroLabelClass}>Marketing Results</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Department revenue, budget, and channel results in one place.
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/marketing-performance"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Back to Marketing Dashboard
            </Link>
            <Link
              href="/marketing-performance/tasks"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open Marketing Tasks
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "TEAM SALES TARGET", value: `${marketingWorkbookContext.salesRevenueTarget}M`, note: "Monthly team goal" },
          { label: "ACTUAL SALES", value: `${marketingWorkbookContext.actualSalesRevenue}M`, note: "Current booked result" },
          { label: "REVENUE GAP", value: `${revenueGap}M`, note: "Target still to close" },
          { label: "BUDGET REMAINING", value: `${budgetRemaining.toFixed(1)}M`, note: "Available marketing budget" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className={lightCardLabelClass}>{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">RESULTS BY OWNER</p>
              <h2 className="text-2xl font-semibold text-slate-900">Monthly KPI result blocks</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {groupedResults.map(([owner, rows]) => (
              <div key={owner} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">{owner}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {rows.length} KPI block{rows.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="divide-y divide-slate-100 md:hidden">
                    {rows.map((row) => (
                      <div key={`${owner}-${row.metric}`} className="space-y-3 px-4 py-4">
                        <p className="text-base font-semibold text-slate-900">{row.metric}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Target</p>
                            <p className="mt-1 text-slate-700">{row.estimated}M</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Actual</p>
                            <p className="mt-1 text-slate-700">{row.actual}M</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Remaining</p>
                            <p className="mt-1 text-slate-700">{row.remaining}M</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">KPI Unit</p>
                            <p className="mt-1 text-slate-700">{row.kpiUnit.toFixed(2)}M</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <div className="min-w-[640px]">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Metric</th>
                            <th className="px-4 py-3 font-medium">Target</th>
                            <th className="px-4 py-3 font-medium">Actual</th>
                            <th className="px-4 py-3 font-medium">Remaining</th>
                            <th className="px-4 py-3 font-medium">KPI Unit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((row) => (
                            <tr key={`${owner}-${row.metric}`}>
                              <td className="px-4 py-3 font-medium text-slate-900">{row.metric}</td>
                              <td className="px-4 py-3 text-slate-700">{row.estimated}M</td>
                              <td className="px-4 py-3 text-slate-700">{row.actual}M</td>
                              <td className="px-4 py-3 text-slate-700">{row.remaining}M</td>
                              <td className="px-4 py-3 text-slate-700">{row.kpiUnit.toFixed(2)}M</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">CHANNEL PERFORMANCE</p>
                <h2 className="text-2xl font-semibold text-slate-900">Budget mix and actual ratio</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {marketingChannelSetup.map((channel) => (
                <div key={channel.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{channel.channel}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {toPercent(channel.actualRatio)} actual ratio
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                    <p>Budget {channel.budget}M</p>
                    <p>Actual {channel.actualBudget}M</p>
                    <p>Remaining {channel.remainingBudget}M</p>
                    <p>Budget share {toPercent(channel.budgetRatio)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">HEADCOUNT STATUS</p>
                <h2 className="text-2xl font-semibold text-slate-900">Role readiness snapshot</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {marketingHeadcountPlan.map((role) => (
                <div key={role.role} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{role.role}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {role.actual}/{role.estimated}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Remaining {role.remaining} · Owner {role.owner || "-"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">DEPARTMENT VIEW</p>
                <h2 className="text-2xl font-semibold text-slate-900">Marketing monthly result snapshot</h2>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sales Revenue</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {marketingWorkbookContext.actualSalesRevenue}M / {marketingWorkbookContext.salesRevenueTarget}M
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Expense Budget</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {marketingWorkbookContext.actualExpenseBudget}M / {marketingWorkbookContext.expenseBudgetTarget}M
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
