import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, ClipboardCheck, Database, UserCircle2 } from "lucide-react";

import { salesKpiProducts } from "@/lib/demo-data";
import type { SalesAsmResolved } from "@/lib/sales/queries";
import { getAsmScorecard, getSalesPeriodLabel } from "@/lib/sales/scorecards";

type SalesPerformanceDetailProps = {
  asm: SalesAsmResolved;
};

function getStatusColor(passed: boolean) {
  return passed ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";
}

export function SalesPerformanceDetail({ asm }: SalesPerformanceDetailProps) {
  const scorecard = getAsmScorecard(asm);
  const periodLabel = getSalesPeriodLabel(asm.periodKey);

  const keyChecks = [
    {
      ...salesKpiProducts.HB031,
      actual: asm.hb031,
      threshold: salesKpiProducts.HB031.target * salesKpiProducts.HB031.minPct
    },
    {
      ...salesKpiProducts.HB035,
      actual: asm.hb035,
      threshold: salesKpiProducts.HB035.target * salesKpiProducts.HB035.minPct
    }
  ];

  const clearChecks = [
    {
      ...salesKpiProducts.HB006,
      actual: asm.hb006,
      threshold: salesKpiProducts.HB006.target * salesKpiProducts.HB006.minPct
    },
    {
      ...salesKpiProducts.HB034,
      actual: asm.hb034,
      threshold: salesKpiProducts.HB034.target * salesKpiProducts.HB034.minPct
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <Link
          href="/sales-performance"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to KPI board
        </Link>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              ASM detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{asm.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {asm.id} · {asm.region} · Period {periodLabel}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              {asm.source === "supabase" ? "Live data from Supabase" : "Seeded fallback data"}
              {asm.fromDate && asm.toDate ? ` · Sync window ${asm.fromDate} to ${asm.toDate}` : ""}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Total KPI", value: `${scorecard.total}/100` },
                { label: "KPI payout", value: `${scorecard.payout}M` },
                { label: "Manager KPI", value: `${scorecard.manualScore}/5` },
                { label: "Reporting", value: `${scorecard.reportingScore}/5` }
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
            { icon: Database, label: "Revenue", value: `${asm.revenueActual}/${asm.revenueTarget}M`, note: `${scorecard.revenuePct}% of target` },
            { icon: ClipboardCheck, label: "New customers", value: `${asm.newCustomersActual}/${asm.newCustomersTarget}`, note: `${scorecard.customerScore}/15 points` },
            { icon: UserCircle2, label: "Manager", value: asm.manager, note: "Field review owner" },
            {
              icon: BadgeDollarSign,
              label: "Payout formula",
              value: "4.1% x target revenue x factor",
              note: asm.sourceSyncedAt ? `Last synced ${new Date(asm.sourceSyncedAt).toLocaleString("en-US")}` : "Aligned with the legacy KPI site"
            }
          ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <card.icon className="h-5 w-5 text-brand-700" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">KPI breakdown</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: "3.1 Revenue", value: `${scorecard.revenueScore}/65`, detail: `${scorecard.revenuePct}% revenue attainment` },
              { label: "3.2 New customers", value: `${scorecard.customerScore}/15`, detail: `${asm.newCustomersActual} new customers` },
              { label: "3.3 Key SKU", value: `${scorecard.keySkuScore}/5`, detail: "Both HB031 and HB035 must reach at least 50%" },
              { label: "3.4 Clearstock", value: `${scorecard.clearstockScore}/10`, detail: "HB006 and HB034 are scored against the 80% threshold" },
              { label: "3.5 Discipline", value: `${scorecard.manualScore}/5`, detail: "Entered manually by the manager" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">Manager review</h2>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Manager note</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{asm.managerNote}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Discipline</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{scorecard.manualScore}/5</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reporting quality</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{scorecard.reportingScore}/5</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">SKU Key detail</h2>
          <div className="mt-6 space-y-4">
            {keyChecks.map((item) => {
              const passed = item.actual >= item.threshold;

              return (
                <div key={item.code} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.code} · {item.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Actual {item.actual} · Min {Math.ceil(item.threshold)} · Target {item.target}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(passed)}`}>
                      {passed ? "Passed" : "Not met"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">Clearstock detail</h2>
          <div className="mt-6 space-y-4">
            {clearChecks.map((item) => {
              const passed = item.actual >= item.threshold;

              return (
                <div key={item.code} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.code} · {item.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Actual {item.actual} · Min {Math.ceil(item.threshold)} · Target {item.target}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(passed)}`}>
                      {passed ? "Passed" : "Not met"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
