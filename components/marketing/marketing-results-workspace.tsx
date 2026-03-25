import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

import {
  marketingReportSummary,
  marketingWorkbookContext,
} from "@/lib/demo-data";
import type { MarketingManualInputs } from "@/lib/marketing/kpi-templates";
import { getMarketingTeamExecutionSummary } from "@/lib/marketing/execution";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";
import { MarketingManualKpiResults } from "@/components/marketing/marketing-manual-kpi-results";

function toPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

function formatMillion(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}M`;
}

type MarketingResultsWorkspaceProps = {
  tasks?: MarketingTaskRecord[];
  manualInputs?: MarketingManualInputs;
  manualSource?: "supabase" | "local";
};

export function MarketingResultsWorkspace({ tasks = [], manualInputs, manualSource = "local" }: MarketingResultsWorkspaceProps) {
  const budgetRemaining = marketingWorkbookContext.expenseBudgetTarget - marketingWorkbookContext.actualExpenseBudget;
  const purchaseOrderRemaining = Math.max(
    0,
    Math.round(marketingReportSummary.purchaseOrderTarget - marketingReportSummary.totalPurchaseOrders)
  );
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const lightCardLabelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";
  const executionSummary = getMarketingTeamExecutionSummary(tasks);

  const teamKpis = [
    {
      name: "Team sales revenue",
      target: formatMillion(marketingWorkbookContext.salesRevenueTarget),
      actual: formatMillion(marketingWorkbookContext.actualSalesRevenue),
      ratio: toPercent(marketingWorkbookContext.actualSalesRevenue / marketingWorkbookContext.salesRevenueTarget),
      weight: "40%",
    },
    {
      name: "Expense budget control",
      target: formatMillion(marketingWorkbookContext.expenseBudgetTarget),
      actual: formatMillion(marketingWorkbookContext.actualExpenseBudget),
      ratio: toPercent(marketingWorkbookContext.actualExpenseBudget / marketingWorkbookContext.expenseBudgetTarget),
      weight: "20%",
    },
    {
      name: "Task execution",
      target: `${tasks.length}`,
      actual: `${executionSummary.completedTasks}`,
      ratio: toPercent(executionSummary.totalTasks ? executionSummary.completedTasks / executionSummary.totalTasks : 0),
      weight: "15%",
    },
  ];

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
              href="/marketing-performance/targets"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Open Marketing Targets
            </Link>
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
          { label: "TEAM SALES TARGET", value: formatMillion(marketingWorkbookContext.salesRevenueTarget), note: "Monthly team goal" },
          { label: "ACTUAL SALES", value: formatMillion(marketingWorkbookContext.actualSalesRevenue), note: "Current booked result" },
          { label: "PO REMAINING", value: purchaseOrderRemaining.toLocaleString("en-US"), note: "Purchase orders left to target" },
          { label: "BUDGET REMAINING", value: formatMillion(Number(budgetRemaining.toFixed(1))), note: "Available marketing budget" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className={lightCardLabelClass}>{card.label}</p>
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
            <p className="text-sm font-medium text-brand-700">Team KPI</p>
            <h2 className="text-2xl font-semibold text-slate-900">Department KPI structure</h2>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200">
          <div className="divide-y divide-slate-100 bg-white md:hidden">
            {teamKpis.map((row) => (
              <div key={row.name} className="space-y-3 px-4 py-4">
                <p className="text-base font-semibold text-slate-900">{row.name}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Target</p>
                    <p className="mt-1 text-slate-700">{row.target}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Actual</p>
                    <p className="mt-1 text-slate-700">{row.actual}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Ratio</p>
                    <p className="mt-1 text-slate-700">{row.ratio}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Weight</p>
                    <p className="mt-1 text-slate-700">{row.weight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[680px]">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-medium">KPI</th>
                    <th className="px-4 py-4 font-medium">Target</th>
                    <th className="px-4 py-4 font-medium">Actual</th>
                    <th className="px-4 py-4 font-medium">Ratio</th>
                    <th className="px-4 py-4 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {teamKpis.map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-4 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 text-slate-700">{row.target}</td>
                      <td className="px-4 py-4 text-slate-700">{row.actual}</td>
                      <td className="px-4 py-4 text-slate-700">{row.ratio}</td>
                      <td className="px-4 py-4 text-slate-700">{row.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <MarketingManualKpiResults
        tasks={tasks}
        monthKey={marketingWorkbookContext.monthKey}
        initialInputs={manualInputs}
        source={manualSource}
        mode="results"
      />
    </div>
  );
}
