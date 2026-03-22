import { BarChart3, Calculator, DatabaseZap, ShieldCheck, Users } from "lucide-react";

import { demoErpPipeline, demoSalesAsms, salesScoringRules } from "@/lib/demo-data";

function calculateScorecard(asm: (typeof demoSalesAsms)[number]) {
  const revenuePct = Math.round((asm.revenueActual / asm.revenueTarget) * 100);
  const revenueScore = revenuePct >= 100 ? 65 : revenuePct >= 80 ? 55 : revenuePct >= 60 ? 40 : 20;
  const customerScore =
    asm.newCustomersActual >= 10 ? 15 : asm.newCustomersActual >= 7 ? 10 : asm.newCustomersActual >= 4 ? 5 : 0;
  const keySkuScore = asm.hb031 >= asm.keySkuTarget && asm.hb035 >= asm.keySkuTarget ? 5 : 0;
  const clearstockHits = Number(asm.hb006 >= asm.clearstockTarget) + Number(asm.hb034 >= asm.clearstockTarget);
  const clearstockScore = clearstockHits === 2 ? 10 : clearstockHits === 1 ? 5 : 0;
  const reviewScore = asm.disciplineScore + asm.reportingScore;
  const total = revenueScore + customerScore + keySkuScore + clearstockScore + reviewScore;
  const payout = total >= 85 ? 12 : total >= 75 ? 10 : total >= 60 ? 8 : 5;

  return {
    revenuePct,
    revenueScore,
    customerScore,
    keySkuScore,
    clearstockScore,
    reviewScore,
    total,
    payout
  };
}

export function SalesPerformanceHub() {
  const scorecards = demoSalesAsms.map((asm) => ({
    ...asm,
    scorecard: calculateScorecard(asm)
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr] xl:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              Sales Performance
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              ERP-driven KPI scorecards with manager review layered on top.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              This module is designed for the real operating flow you described: hard sales numbers come
              in automatically from ERP, while manager-entered review KPIs complete the scorecard and payout logic.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "ASM scorecards", value: "3 live" },
                { label: "ERP-fed KPIs", value: "4 metrics" },
                { label: "Manual review KPIs", value: "2 metrics" },
                { label: "Payout preview", value: "Enabled" }
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">ASM scorecards</p>
              <h2 className="text-2xl font-semibold text-slate-900">Current cycle</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">ASM</th>
                  <th className="px-4 py-4 font-medium">Revenue</th>
                  <th className="px-4 py-4 font-medium">Auto score</th>
                  <th className="px-4 py-4 font-medium">Manager review</th>
                  <th className="px-4 py-4 font-medium">Total</th>
                  <th className="px-4 py-4 font-medium">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scorecards.map((asm) => (
                  <tr key={asm.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{asm.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{asm.region}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {asm.revenueActual}/{asm.revenueTarget}M
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{asm.scorecard.revenuePct}% target</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {asm.scorecard.revenueScore + asm.scorecard.customerScore + asm.scorecard.keySkuScore + asm.scorecard.clearstockScore} pts
                    </td>
                    <td className="px-4 py-4 text-slate-700">{asm.scorecard.reviewScore} pts</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                        {asm.scorecard.total} pts
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-brand-700">{asm.scorecard.payout}M</td>
                  </tr>
                ))}
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
                <p className="text-sm font-medium text-brand-700">Manager review</p>
                <h2 className="text-2xl font-semibold text-slate-900">Soft KPI overlay</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {scorecards.map((asm) => (
                <div key={asm.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{asm.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Manager: {asm.manager}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      Review {asm.scorecard.reviewScore}/10
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{asm.managerNote}</p>
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

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">What this proves</p>
            <h2 className="text-2xl font-semibold text-slate-900">You can separate ERP facts from manager judgment cleanly</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">ERP-fed facts</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Revenue, SKU, customer, and stock metrics should flow in automatically and remain immutable in the scorecard.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Manager inputs</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Review-only KPIs like discipline, reporting quality, and exception notes stay manual and auditable.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Executive outputs</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              HB Execution OS then rolls everything into payout view, department health, and leadership reporting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
