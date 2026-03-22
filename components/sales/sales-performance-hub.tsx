import Link from "next/link";
import { ArrowRight, BarChart3, Calculator, DatabaseZap, ShieldCheck, Users } from "lucide-react";

import { demoErpPipeline, salesKpiProducts, salesScoringRules } from "@/lib/demo-data";
import { getSalesScorecards } from "@/lib/sales/scorecards";

function getHealthTone(total: number) {
  if (total >= 80) return "text-emerald-700 bg-emerald-50";
  if (total >= 60) return "text-amber-700 bg-amber-50";
  return "text-rose-700 bg-rose-50";
}

export function SalesPerformanceHub() {
  const scorecards = getSalesScorecards();
  const totalRevenue = scorecards.reduce((sum, asm) => sum + asm.revenueActual, 0);
  const totalPayout = scorecards.reduce((sum, asm) => sum + asm.scorecard.payout, 0);
  const aboveEighty = scorecards.filter((asm) => asm.scorecard.revenuePct >= 80).length;
  const averageKpi = Math.round(scorecards.reduce((sum, asm) => sum + asm.scorecard.total, 0) / scorecards.length);

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
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "ASM scorecards", value: `${scorecards.length} live` },
                { label: "Current period", value: scorecards[0]?.periodLabel ?? "-" },
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
          { label: "Average KPI", value: `${averageKpi} pts`, note: "Total score / 100" },
          { label: "Above 80% revenue", value: `${aboveEighty}/${scorecards.length}`, note: "Revenue threshold" },
          { label: "Projected KPI payout", value: `${totalPayout.toLocaleString("en-US")}M`, note: "Based on the original formula" }
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
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
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">ASM</th>
                  <th className="px-4 py-4 font-medium">Revenue</th>
                  <th className="px-4 py-4 font-medium">ERP score</th>
                  <th className="px-4 py-4 font-medium">Manager KPI</th>
                  <th className="px-4 py-4 font-medium">Total</th>
                  <th className="px-4 py-4 font-medium">KPI payout</th>
                  <th className="px-4 py-4 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scorecards.map((asm) => {
                  const erpScore =
                    asm.scorecard.revenueScore +
                    asm.scorecard.customerScore +
                    asm.scorecard.keySkuScore +
                    asm.scorecard.clearstockScore;

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
                        <div className="mt-1 text-xs text-slate-500">{asm.scorecard.revenuePct}% target</div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{erpScore} pts</td>
                      <td className="px-4 py-4 text-slate-700">{asm.scorecard.manualScore}/5</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getHealthTone(asm.scorecard.total)}`}>
                          {asm.scorecard.total} pts
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-brand-700">{asm.scorecard.payout}M</td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/sales-performance/${asm.id}`}
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Manager inputs</p>
              <h2 className="text-2xl font-semibold text-slate-900">Reporting and discipline overlay</h2>
            </div>
          </div>

            <div className="mt-6 space-y-4">
              {scorecards.slice(0, 5).map((asm) => (
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
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <BarChart3 className="h-5 w-5" />
              </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Real SKU targets</p>
              <h2 className="text-2xl font-semibold text-slate-900">Targets currently used in the legacy KPI site</h2>
            </div>
          </div>

            <div className="mt-6 space-y-3">
              {Object.values(salesKpiProducts).map((product) => (
                <div key={product.code} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {product.code} · {product.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Target {product.target} · Threshold {Math.round(product.minPct * 100)}%
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                      {product.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <DatabaseZap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">ERP pipeline</p>
              <h2 className="text-2xl font-semibold text-slate-900">Target integration flow</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {demoErpPipeline.map((step, index) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{step.step}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Scoring logic</p>
              <h2 className="text-2xl font-semibold text-slate-900">Rule engine shell</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
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
        </div>
      </section>
    </div>
  );
}
