import Link from "next/link";
import { ArrowRight, BarChart3, Calculator, Users } from "lucide-react";

import { syncSalesPeriodAction } from "@/app/(app)/sales-performance/actions";
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
  canSync: boolean;
  syncStatus?: string;
  syncMessage?: string;
};

export function SalesPerformanceHub({
  scorecards,
  liveCount,
  periods,
  selectedPeriod,
  canSync,
  syncStatus,
  syncMessage,
}: SalesPerformanceHubProps) {
  const totalRevenue = scorecards.reduce((sum, asm) => sum + asm.revenueActual, 0);
  const totalPayout = scorecards.reduce((sum, asm) => sum + asm.scorecard.payout, 0);
  const aboveEighty = scorecards.filter((asm) => asm.scorecard.revenuePct >= 80).length;
  const averageKpi = scorecards.length
    ? Math.round(scorecards.reduce((sum, asm) => sum + asm.scorecard.total, 0) / scorecards.length)
    : 0;
  const totalCustomers = scorecards.reduce((sum, asm) => sum + asm.newCustomersActual, 0);
  const skuQualified = scorecards.filter((asm) => asm.scorecard.keySkuScore > 0).length;
  const clearstockQualified = scorecards.filter((asm) => asm.scorecard.clearstockScore > 0).length;
  const selectedPeriodLabel = periods.find((period) => period.key === selectedPeriod)?.label ?? scorecards[0]?.periodLabel ?? "-";
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

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              Sales Performance
            </p>
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

          <h1 className="max-w-6xl text-3xl font-semibold tracking-tight xl:text-[3.25rem] xl:leading-[1.05]">
            Real ASM scorecards with KPI drill-down, not just a top-line dashboard.
          </h1>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <label htmlFor="period" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Tracking period
              </label>
              <div className="mt-3 flex flex-col gap-3 lg:flex-row">
                <form method="get" className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <select
                    id="period"
                    name="period"
                    defaultValue={selectedPeriod}
                    className="h-11 min-w-[220px] rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-sky-300"
                  >
                    {periods.map((period) => (
                      <option key={period.key} value={period.key} className="text-slate-900">
                        {period.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                  >
                    Apply period
                  </button>
                </form>

                {canSync ? (
                  <form action={syncSalesPeriodAction}>
                    <input type="hidden" name="period" value={selectedPeriod} />
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Sync all ASM in month
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "ASM SCORECARDS", value: `${scorecards.length} LIVE` },
                { label: "CURRENT PERIOD", value: selectedPeriodLabel.toUpperCase() },
                { label: "SCORING MODEL", value: "SALES REVENUE\nDEALERS CODE\nKEY SKU\nCLEARSTOCK" },
                { label: "DETAIL VIEW", value: "PER ASM" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                  <p className="mt-3 whitespace-pre-line text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "TOTAL SALES REVENUE", value: `${totalRevenue.toLocaleString("en-US")}M`, note: "ERP sales execution feed" },
          { label: "TOTAL DEALERS CODE", value: `${totalCustomers}`, note: "Live monthly dealer acquisition" },
          { label: "QUALIFIED ON KEY SKU", value: `${skuQualified}/${scorecards.length}`, note: "Based on configured SKU codes" },
          { label: "QUALIFIED ON CLEARSTOCK", value: `${clearstockQualified}/${scorecards.length}`, note: "Based on configured clearstock codes" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "AVERAGE TOTAL KPI", value: `${averageKpi} pts`, note: "Overall score out of 100" },
          { label: "ABOVE 80% REVENUE", value: `${aboveEighty}/${scorecards.length}`, note: "Revenue achievement threshold" },
          { label: "PROJECTED KPI PAYOUT", value: `${totalPayout.toLocaleString("en-US")}M`, note: "Based on the original formula" }
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
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700">ASM SCORECARDS</p>
            <h2 className="text-2xl font-semibold text-slate-900">Built around the real ASM roster</h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          {scorecards.length ? (
            <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[11%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">ASM</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">SALES REVENUE</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">DEALERS CODE</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">KEY SKU</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">CLEARSTOCK</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">DISCIPLINE</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">TOTAL</th>
                  <th className="px-4 py-4 font-medium uppercase tracking-[0.12em]">KPI PAYOUT</th>
                  <th className="px-4 py-4 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scorecards.map((asm) => {
                  return (
                    <tr key={asm.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{asm.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{asm.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {asm.revenueActual}/{asm.revenueTarget}M
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {asm.scorecard.revenueScore}/65 · {asm.scorecard.revenuePct}% target
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {asm.newCustomersActual}/{asm.newCustomersTarget}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.customerScore}/15</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 font-medium text-slate-900">
                          {asm.keySkuTargets.map((item) => (
                            <div key={item.code} className="whitespace-nowrap">
                              {item.code} {item.actual}/{item.target}
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.keySkuScore}/5</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 font-medium text-slate-900">
                          {asm.clearstockTargets.map((item) => (
                            <div key={item.code} className="whitespace-nowrap">
                              {item.code} {item.actual}/{item.target}
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.clearstockScore}/10</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{asm.scorecard.manualScore}/5</div>
                        <div className="mt-1 text-xs text-slate-500">Manager review</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getHealthTone(asm.scorecard.total)}`}>
                          {asm.scorecard.total} pts
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-brand-700">{asm.scorecard.payout}M</td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/sales-performance/${asm.id}?period=${selectedPeriod}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
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
