import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, Gauge, Users } from "lucide-react";

import {
  marketingHeadcountPlan,
  marketingResultsTracker,
  marketingWorkbookContext,
} from "@/lib/demo-data";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";
import { getMarketingExecutionScore, getMarketingTeamExecutionSummary } from "@/lib/marketing/execution";

function percent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

type MarketingKpisWorkspaceProps = {
  tasks?: MarketingTaskRecord[];
};

export function MarketingKpisWorkspace({ tasks = [] }: MarketingKpisWorkspaceProps) {
  const effectiveTasks = tasks.length ? tasks : [];
  const executionSummary = getMarketingTeamExecutionSummary(effectiveTasks);
  const personKpiRows = Array.from(
    marketingResultsTracker
      .reduce((map, row) => {
        const existing = map.get(row.owner) ?? {
          owner: row.owner,
          targetTotal: 0,
          actualTotal: 0,
          remainingTotal: 0,
          taskCount: effectiveTasks.filter((task) => task.owner === row.owner).length,
          metricCount: 0,
        };

        existing.targetTotal += row.estimated;
        existing.actualTotal += row.actual;
        existing.remainingTotal += row.remaining;
        existing.metricCount += 1;
        map.set(row.owner, existing);
        return map;
      }, new Map<string, { owner: string; targetTotal: number; actualTotal: number; remainingTotal: number; taskCount: number; metricCount: number }>())
      .values()
  ).map((row) => {
    const ratio = row.targetTotal ? row.actualTotal / row.targetTotal : 0;
    const outcomeScore = Math.min(60, Math.round(ratio * 60));
    const execution = getMarketingExecutionScore(row.owner, effectiveTasks);
    const executionScore = execution.executionScore;
    const totalScore = outcomeScore + executionScore;

    return {
      ...row,
      ratio,
      outcomeScore,
      completionRate: execution.completionRate,
      overdueTasks: execution.overdueTasks,
      executionScore,
      totalScore,
    };
  });

  const teamKpis = [
    {
      name: "TEAM SALES REVENUE",
      target: `${marketingWorkbookContext.salesRevenueTarget}M`,
      actual: `${marketingWorkbookContext.actualSalesRevenue}M`,
      ratio: percent(marketingWorkbookContext.actualSalesRevenue / marketingWorkbookContext.salesRevenueTarget),
      weight: "40%",
    },
    {
      name: "EXPENSE BUDGET CONTROL",
      target: `${marketingWorkbookContext.expenseBudgetTarget}M`,
      actual: `${marketingWorkbookContext.actualExpenseBudget}M`,
      ratio: percent(marketingWorkbookContext.actualExpenseBudget / marketingWorkbookContext.expenseBudgetTarget),
      weight: "20%",
    },
    {
      name: "HEADCOUNT READINESS",
      target: `${marketingWorkbookContext.headcountPlanned}`,
      actual: `${marketingWorkbookContext.headcountActual}`,
      ratio: percent(marketingWorkbookContext.headcountActual / marketingWorkbookContext.headcountPlanned),
      weight: "15%",
    },
    {
      name: "TASK EXECUTION",
      target: `${effectiveTasks.length}`,
      actual: `${executionSummary.completedTasks}`,
      ratio: percent(executionSummary.totalTasks ? executionSummary.completedTasks / executionSummary.totalTasks : 0),
      weight: "25%",
    },
  ];

  const roleKpiSetup = marketingHeadcountPlan.map((role) => ({
    role: role.role,
    setup:
      role.role === "Digital Marketer"
        ? "Budget + channel revenue + landing page delivery + task completion"
        : role.role === "E-Com Operations"
          ? "Platform sales + execution completion + task completion"
          : role.role === "Graphic Designer"
            ? "Asset delivery + on-time completion + task completion"
            : role.role === "Media Editor"
              ? "Editing output + turnaround + task completion"
              : role.role === "Fresher AI Officer"
                ? "Automation support + experiment output + task completion"
                : "Role readiness + output delivery",
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Marketing KPIs</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Person KPI and team KPI scoring in one Marketing layer.
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
              href="/marketing-performance/results"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open Marketing Results
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "TEAM KPI BLOCKS", value: String(teamKpis.length), note: "Department scoring categories" },
          { label: "PERSON KPI ROWS", value: String(personKpiRows.length), note: "Owner score roll-ups" },
          { label: "ROLE SETUPS", value: String(roleKpiSetup.length), note: "Role-specific KPI logic" },
          { label: "TASK INPUTS", value: String(effectiveTasks.length), note: "Execution feed into KPI" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">TEAM KPI</p>
              <h2 className="text-2xl font-semibold text-slate-900">Department scorecard structure</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
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

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">ROLE KPI SETUP</p>
              <h2 className="text-2xl font-semibold text-slate-900">Role-based KPI logic</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {roleKpiSetup.map((role) => (
              <div key={role.role} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="font-medium text-slate-900">{role.role}</p>
                <p className="mt-2 text-sm text-slate-500">{role.setup}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">PERSON KPI</p>
              <h2 className="text-2xl font-semibold text-slate-900">Monthly score roll-up by owner</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Owner</th>
                  <th className="px-4 py-4 font-medium">Target</th>
                  <th className="px-4 py-4 font-medium">Actual</th>
                  <th className="px-4 py-4 font-medium">Ratio</th>
                  <th className="px-4 py-4 font-medium">Outcome</th>
                  <th className="px-4 py-4 font-medium">Execution</th>
                  <th className="px-4 py-4 font-medium">Task Completion</th>
                  <th className="px-4 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {personKpiRows.map((row) => (
                  <tr key={row.owner}>
                    <td className="px-4 py-4 font-medium text-slate-900">{row.owner}</td>
                    <td className="px-4 py-4 text-slate-700">{row.targetTotal.toFixed(1)}M</td>
                    <td className="px-4 py-4 text-slate-700">{row.actualTotal.toFixed(1)}M</td>
                    <td className="px-4 py-4 text-slate-700">{percent(row.ratio)}</td>
                    <td className="px-4 py-4 text-slate-700">{row.outcomeScore}/60</td>
                    <td className="px-4 py-4 text-slate-700">{row.executionScore}/40</td>
                    <td className="px-4 py-4 text-slate-700">
                      {percent(row.completionRate)}{row.overdueTasks ? ` · ${row.overdueTasks} overdue` : ""}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{row.totalScore}/100</td>
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
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">SCORING LOGIC</p>
                <h2 className="text-2xl font-semibold text-slate-900">How KPI should be judged</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Outcome KPI should come from revenue, budget, platform, and role output.",
                "Execution KPI now comes directly from task status quality, completion rate, and overdue penalties.",
                "Recommended weighting: 60% outcome and 40% execution.",
                "Monthly final score should combine both before any incentive logic is added.",
              ].map((line) => (
                <div key={line} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  {line}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">KPI INPUTS</p>
                <h2 className="text-2xl font-semibold text-slate-900">What feeds the score</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                `Marketing results rows: ${marketingResultsTracker.length}`,
                `Headcount setup rows: ${marketingHeadcountPlan.length}`,
                `Task execution rows: ${effectiveTasks.length}`,
                `Average execution score: ${executionSummary.averageExecutionScore}/40`,
              ].map((line) => (
                <div key={line} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  {line}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
