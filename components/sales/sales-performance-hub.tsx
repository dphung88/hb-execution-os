import Link from "next/link";
import { ArrowRight, BarChart3, Calculator, Users } from "lucide-react";

import { salesKpiProducts, salesScoringRules } from "@/lib/demo-data";
import type { SalesAsmResolved, SalesPeriodOption } from "@/lib/sales/queries";
import type { SalesAsmScorecard } from "@/lib/sales/scorecards";

function getHealthTone(total: number) {
  if (total >= 80) return "text-emerald-700 bg-emerald-50";
  if (total >= 60) return "text-amber-700 bg-amber-50";
  return "text-rose-700 bg-rose-50";
}

type SalesPerformanceHubProps = {
  scorecards: Array<SalesAsmResolved & { periodLabel: string; scorecard: SalesAsmScorecard }>;
  liveCount: number;
  periods: SalesPeriodOption[];
  selectedPeriod: string;
  syncStatus?: string;
  syncMessage?: string;
};

export function SalesPerformanceHub({
  scorecards,
  liveCount,
  periods,
  selectedPeriod,
  syncStatus,
  syncMessage,
}: SalesPerformanceHubProps) {
  const totalRevenue = scorecards.reduce((sum, asm) => sum + asm.revenueActual, 0);
  const aboveEighty = scorecards.filter((asm) => asm.scorecard.revenuePct >= 80).length;
  const asmKpiSeventy = scorecards.filter((asm) => asm.scorecard.total >= 70).length;
  const totalCustomers = scorecards.reduce((sum, asm) => sum + asm.newCustomersActual, 0);
  const skuQualified = scorecards.filter((asm) => asm.scorecard.keySkuScore > 0).length;
  const clearstockQualified = scorecards.filter((asm) => asm.scorecard.clearstockScore > 0).length;
  const summaryKeySkuTargets = scorecards[0]?.keySkuTargets ?? Object.values(salesKpiProducts)
    .filter((product) => product.category === "key")
    .map((product) => ({
      code: product.code,
      name: product.name,
      target: product.target,
      minPct: product.minPct,
      actual: 0,
    }));
  const summaryClearstockTargets = scorecards[0]?.clearstockTargets ?? Object.values(salesKpiProducts)
    .filter((product) => product.category === "clearstock")
    .map((product) => ({
      code: product.code,
      name: product.name,
      target: product.target,
      minPct: product.minPct,
      actual: 0,
    }));
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={heroLabelClass}>Sales Dashboard</p>
              {syncStatus ? (
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    syncStatus === "success"
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-rose-400/20 text-rose-200"
                  }`}
                >
                  {syncStatus === "success" ? syncMessage ?? "Sync completed." : syncMessage ?? "Sync failed."}
                </div>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight">
              Sales execution, ASM scorecards, and payout visibility in one place.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end xl:flex-nowrap">
            <Link
              href={`/sales-performance/targets?period=${selectedPeriod}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open Sales Targets
            </Link>

            <form
              method="get"
              className="flex flex-wrap items-center gap-3 xl:flex-nowrap"
            >
              <div className="w-[170px] xl:w-[170px]">
                <label htmlFor="period" className={`${darkCardLabelClass} sr-only`}>
                  Tracking period
                </label>
                <select
                  id="period"
                  name="period"
                  defaultValue={selectedPeriod}
                  className="h-11 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-sky-300"
                >
                  {periods.map((period) => (
                    <option key={period.key} value={period.key} className="text-slate-900">
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Apply period
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "SALES REVENUE", value: `${totalRevenue.toLocaleString("en-US")}M` },
            { label: "REVENUE >= 80%", value: `${aboveEighty}/${scorecards.length}` },
            { label: "TOTAL DEALERS CODE", value: `${totalCustomers}` },
            { label: "QUALIFIED ON KEY SKU", value: `${skuQualified}/${scorecards.length}` },
            { label: "QUALIFIED ON CLEARSTOCK", value: `${clearstockQualified}/${scorecards.length}` },
            { label: "ASM KPI SCORE >= 70%", value: `${asmKpiSeventy}/${scorecards.length}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4">
              <p className={darkCardLabelClass}>{item.label}</p>
              <p className={darkCardValueClass}>{item.value}</p>
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
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700">ASM SCORECARDS</p>
            <h2 className="text-2xl font-semibold text-slate-900">Built around the real ASM roster</h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          {scorecards.length ? (
            <>
              <div className="divide-y divide-slate-100 bg-white md:hidden">
                {scorecards.map((asm) => (
                  <div key={asm.id} className="space-y-4 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{asm.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{asm.id}</p>
                      </div>
                      <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getHealthTone(asm.scorecard.total)}`}>
                        {asm.scorecard.total} pts
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sales Revenue</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{asm.revenueActual}/{asm.revenueTarget}M</p>
                        <p className="mt-1 text-xs text-slate-500">{asm.scorecard.revenueScore}/65 · {asm.scorecard.revenuePct}% target</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dealers Code</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{asm.newCustomersActual}/{asm.newCustomersTarget}</p>
                        <p className="mt-1 text-xs text-slate-500">{asm.scorecard.customerScore}/15</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Key SKU</p>
                        <div className="mt-2 space-y-1 text-sm font-semibold text-slate-900">
                          {asm.keySkuTargets.map((item) => (
                            <div key={item.code}>{item.code} {item.actual}/{item.target}</div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{asm.scorecard.keySkuScore}/5</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Clearstock</p>
                        <div className="mt-2 space-y-1 text-sm font-semibold text-slate-900">
                          {asm.clearstockTargets.map((item) => (
                            <div key={item.code}>{item.code} {item.actual}/{item.target}</div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{asm.scorecard.clearstockScore}/10</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Discipline</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{asm.scorecard.manualScore}/5</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">KPI Payout</p>
                        <p className="mt-2 text-sm font-semibold text-brand-700">{asm.scorecard.payout}M</p>
                      </div>
                    </div>

                    <Link
                      href={`/sales-performance/${asm.id}?period=${selectedPeriod}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      View detail
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>

              <table className="hidden min-w-full table-fixed divide-y divide-slate-200 text-[13px] md:table">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[11%]" />
                </colgroup>
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">ASM</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">SALES REVENUE</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">DEALERS CODE</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">KEY SKU</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">CLEARSTOCK</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">DISCIPLINE</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">TOTAL</th>
                    <th className="px-3 py-4 font-medium uppercase tracking-[0.1em]">KPI PAYOUT</th>
                    <th className="px-3 py-4 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {scorecards.map((asm) => {
                    return (
                      <tr key={asm.id}>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{asm.name}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.id}</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">
                            {asm.revenueActual}/{asm.revenueTarget}M
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {asm.scorecard.revenueScore}/65 · {asm.scorecard.revenuePct}% target
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">
                            {asm.newCustomersActual}/{asm.newCustomersTarget}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.customerScore}/15</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 font-medium leading-6 text-slate-900">
                            {asm.keySkuTargets.map((item) => (
                              <div key={item.code} className="whitespace-nowrap">
                                {item.code} {item.actual}/{item.target}
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.keySkuScore}/5</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 font-medium leading-6 text-slate-900">
                            {asm.clearstockTargets.map((item) => (
                              <div key={item.code} className="whitespace-nowrap">
                                {item.code} {item.actual}/{item.target}
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.clearstockScore}/10</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{asm.scorecard.manualScore}/5</div>
                          <div className="mt-1 text-[11px] text-slate-500">Manager review</div>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${getHealthTone(asm.scorecard.total)}`}>
                            {asm.scorecard.total} pts
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold text-brand-700">{asm.scorecard.payout}M</td>
                        <td className="px-3 py-4 text-right">
                          <Link
                            href={`/sales-performance/${asm.id}?period=${selectedPeriod}`}
                            className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                          >
                            View detail
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-900">No Sales KPI data for this month yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Select another period with live data, then review targets and scoring from there.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700">SKU KPI DETAIL</p>
            <h2 className="text-2xl font-semibold text-slate-900">Placed directly under revenue tracking</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">KEY SKU KPI</p>
            <div className="mt-4 space-y-3">
              {summaryKeySkuTargets.map((product) => (
                  <div key={product.code} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {product.code} · {product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Target {product.target} · Minimum {Math.round(product.minPct * 100)}%
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">CLEARSTOCK KPI</p>
            <div className="mt-4 space-y-3">
              {summaryClearstockTargets.map((product) => (
                  <div key={product.code} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {product.code} · {product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Target {product.target} · Minimum {Math.round(product.minPct * 100)}%
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700">SCORING LOGIC</p>
            <h2 className="text-2xl font-semibold text-slate-900">Scoring logic by KPI</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          {salesScoringRules.map((rule) => (
            <div key={rule.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{rule.name}</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  {rule.score}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{rule.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                Source: {rule.source}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
