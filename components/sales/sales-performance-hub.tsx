import Link from "next/link";
import { ArrowRight, BarChart3, Calculator, ShieldCheck, Users } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              Sales Performance
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Real ASM scorecards with KPI drill-down, not just a top-line dashboard.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              I have aligned this module to the structure of your existing Sales KPI site: real ASM IDs,
              real key-SKU and clearstock targets, manager-entered soft inputs, and a detail view per ASM.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              Tracking period: {selectedPeriodLabel} · Live Supabase rows: {liveCount}
            </p>
            {syncStatus ? (
              <div
                className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                  syncStatus === "success"
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-rose-400/20 text-rose-200"
                }`}
              >
                {syncStatus === "success" ? syncMessage ?? "Sync completed." : syncMessage ?? "Sync failed."}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-5 rounded-2xl border border-white/10 bg-black/10 p-4">
              <label htmlFor="period" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Tracking period
              </label>
              <div className="mt-3 flex flex-col gap-3 xl:flex-row">
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

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "ASM scorecards", value: `${scorecards.length} live` },
                { label: "Current period", value: selectedPeriodLabel },
                { label: "ERP-fed KPIs", value: "Revenue + SKU + Clearstock" },
                { label: "Detail view", value: "Per ASM" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total actual revenue", value: `${totalRevenue.toLocaleString("en-US")}M`, note: "ERP revenue feed" },
          { label: "Total new customers", value: `${totalCustomers}`, note: "Live monthly customer acquisition" },
          { label: "Qualified on key SKU", value: `${skuQualified}/${scorecards.length}`, note: "HB031 + HB035 threshold" },
          { label: "Qualified on clearstock", value: `${clearstockQualified}/${scorecards.length}`, note: "HB006 + HB034 threshold" },
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
          { label: "Average total KPI", value: `${averageKpi} pts`, note: "Overall score out of 100" },
          { label: "Above 80% revenue", value: `${aboveEighty}/${scorecards.length}`, note: "Revenue achievement threshold" },
          { label: "Projected KPI payout", value: `${totalPayout.toLocaleString("en-US")}M`, note: "Based on the original formula" }
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
            <p className="text-sm font-medium text-brand-700">ASM scorecards</p>
            <h2 className="text-2xl font-semibold text-slate-900">Built around the real ASM roster</h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          {scorecards.length ? (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">ASM</th>
                  <th className="px-4 py-4 font-medium">Revenue</th>
                  <th className="px-4 py-4 font-medium">New Customers</th>
                  <th className="px-4 py-4 font-medium">Key SKU</th>
                  <th className="px-4 py-4 font-medium">Clearstock</th>
                  <th className="px-4 py-4 font-medium">Discipline</th>
                  <th className="px-4 py-4 font-medium">Total</th>
                  <th className="px-4 py-4 font-medium">KPI payout</th>
                  <th className="px-4 py-4 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scorecards.map((asm) => {
                  return (
                    <tr key={asm.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{asm.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {asm.id} · {asm.region}
                        </div>
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
                        <div className="font-medium text-slate-900">
                          {asm.hb031}/{asm.hb035}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.keySkuScore}/5</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {asm.hb006}/{asm.hb034}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.clearstockScore}/10</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{asm.scorecard.manualScore}/5</div>
                        <div className="mt-1 text-xs text-slate-500">Manager review</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getHealthTone(asm.scorecard.total)}`}>
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
                Select another period or run ERP sync for the chosen month.
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
            <p className="text-sm font-medium text-brand-700">SKU KPI detail</p>
            <h2 className="text-2xl font-semibold text-slate-900">Placed directly under revenue tracking</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Key SKU KPI</p>
            <div className="mt-4 space-y-3">
              {Object.values(salesKpiProducts)
                .filter((product) => product.category === "key")
                .map((product) => (
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Clearstock KPI</p>
            <div className="mt-4 space-y-3">
              {Object.values(salesKpiProducts)
                .filter((product) => product.category === "clearstock")
                .map((product) => (
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
            <p className="text-sm font-medium text-brand-700">Scoring logic</p>
            <h2 className="text-2xl font-semibold text-slate-900">Rule engine shell</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
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

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Manager review</p>
            <h2 className="text-2xl font-semibold text-slate-900">Reporting and discipline notes</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {scorecards.slice(0, 6).map((asm) => (
            <div key={asm.id} className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{asm.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Manager: {asm.manager}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                  Discipline {asm.scorecard.manualScore}/5
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{asm.managerNote}</p>
            </div>
          ))}
          {!scorecards.length ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Manager review cards will appear after the selected period has live KPI rows.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
