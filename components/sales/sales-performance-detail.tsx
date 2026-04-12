import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeDollarSign, ChevronLeft, ChevronRight, ClipboardCheck, Database, UserCircle2 } from "lucide-react";

import { saveSalesReviewAction, saveSalesTargetsAction } from "@/app/(app)/sales-performance/[id]/actions";
import type { SalesAsmResolved } from "@/lib/sales/queries";
import { calculateIncome, getAsmScorecard, getSalesPeriodLabel } from "@/lib/sales/scorecards";

type SalesPerformanceDetailProps = {
  asm: SalesAsmResolved;
  selectedPeriod: string;
  canEdit: boolean;
  target: {
    [key: string]: unknown;
    revenue_target: number;
    new_customers_target: number;
    key_sku_code_1?: string | null;
    key_sku_code_2?: string | null;
    clearstock_code_1?: string | null;
    clearstock_code_2?: string | null;
    hb006_target: number;
    hb034_target: number;
    hb031_target: number;
    hb035_target: number;
  } | null;
  review: {
    discipline_score: number;
    reporting_score: number;
    manager_note: string | null;
  } | null;
  saveStatus?: string;
  errorStatus?: string;
  prevAsmId?: string | null;
  nextAsmId?: string | null;
};

function getStatusColor(passed: boolean) {
  return passed ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";
}

export async function SalesPerformanceDetail({
  asm,
  selectedPeriod,
  canEdit,
  target,
  review,
  saveStatus,
  errorStatus,
  prevAsmId,
  nextAsmId,
}: SalesPerformanceDetailProps) {
  const scorecard = getAsmScorecard(asm);
  const isProbation = asm.isProbation;
  const income = calculateIncome(scorecard.revenuePct, scorecard.payout, isProbation);
  const periodLabel = await getSalesPeriodLabel(asm.periodKey);
  const fmt = (n: number) => n.toLocaleString("vi-VN");
  const keyChecks = asm.keySkuTargets.map((item) => ({
    ...item,
    threshold: item.target * item.minPct,
  }));
  const clearChecks = asm.clearstockTargets.map((item) => ({
    ...item,
    threshold: item.target * item.minPct,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex items-center gap-2">
          <Link
            href={`/sales-performance?period=${selectedPeriod}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to KPI board
          </Link>
          {prevAsmId && (
            <Link
              href={`/sales-performance/${prevAsmId}?period=${selectedPeriod}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Link>
          )}
          {nextAsmId && (
            <Link
              href={`/sales-performance/${nextAsmId}?period=${selectedPeriod}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
              ASM detail
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{asm.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {asm.id} · Period {periodLabel}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Active territory · {asm.region || "Nationwide"}
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {errorStatus ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Save did not complete</p>
          <p className="mt-2 text-sm text-rose-800">
            {errorStatus === "missing-columns"
              ? "Supabase is still missing the new SKU code columns in sales_monthly_targets, so the target update cannot be stored yet."
              : errorStatus === "rls-blocked"
                ? "Supabase row-level security is blocking write access for this Sales form."
                : "The write request did not finish successfully. If this keeps happening, I will need to re-check the Supabase write policy for the Sales review and target tables."}
          </p>
        </section>
      ) : null}

      {(canEdit || saveStatus) ? (
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Monthly Targets — read-only snapshot, editing is done on /sales-performance/targets */}
          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Monthly Targets</p>
                <h2 className="text-2xl font-semibold text-slate-900">Target Snapshot</h2>
              </div>
              <Link
                href={`/sales-performance/targets?period=${selectedPeriod}`}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                Edit targets
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {/* Sales Target */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">Sales Target</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{target?.revenue_target ?? asm.revenueTarget}M</p>
                <p className="mt-1 text-[10px] text-slate-500">million VND</p>
              </div>
              {/* Dealers Code */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">Dealers Code</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{target?.new_customers_target ?? asm.newCustomersTarget}</p>
                <p className="mt-1 text-[10px] text-slate-500">new codes</p>
              </div>
              {/* Key SKU */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">Key SKU</p>
                <div className="mt-2 space-y-1">
                  {asm.keySkuTargets.map((item) => (
                    <p key={item.code} className="text-sm font-semibold text-slate-900">
                      <span className="text-sky-600">{item.code}</span> · {item.target}
                    </p>
                  ))}
                </div>
              </div>
              {/* Clearstock */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-600">Clearstock</p>
                <div className="mt-2 space-y-1">
                  {asm.clearstockTargets.map((item) => (
                    <p key={item.code} className="text-sm font-semibold text-slate-900">
                      <span className="text-rose-500">{item.code}</span> · {item.target}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Manager review</p>
                <h2 className="text-2xl font-semibold text-slate-900">Save Discipline And Reporting Notes</h2>
              </div>
              {saveStatus === "review" ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Review saved
                </span>
              ) : null}
            </div>

            <form action={saveSalesReviewAction} className="mt-6 space-y-4">
              <input type="hidden" name="asm_id" value={asm.id} />
              <input type="hidden" name="period" value={selectedPeriod} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Discipline score</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    name="discipline_score"
                    defaultValue={review?.discipline_score ?? asm.disciplineScore}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reporting score</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    name="reporting_score"
                    defaultValue={review?.reporting_score ?? asm.reportingScore}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Manager note</span>
                <textarea
                  name="manager_note"
                  defaultValue={review?.manager_note ?? asm.managerNote}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                />
              </label>

<button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save manager review
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Database, label: "Sales Revenue", value: `${asm.revenueActual}/${asm.revenueTarget}M`, note: `${scorecard.revenuePct}% of target`, color: "bg-sky-50 border-sky-100", iconColor: "text-sky-600", labelColor: "text-sky-600" },
            { icon: ClipboardCheck, label: "Dealers Code", value: `${asm.newCustomersActual}/${asm.newCustomersTarget}`, note: `${scorecard.customerScore}/15 points`, color: "bg-violet-50 border-violet-100", iconColor: "text-violet-600", labelColor: "text-violet-600" },
            { icon: UserCircle2, label: "Manager", value: asm.manager, note: "Field review owner", color: "bg-slate-50 border-slate-200", iconColor: "text-slate-500", labelColor: "text-slate-400" },
            { icon: BadgeDollarSign, label: "KPI Payout", value: `${scorecard.payout}M`, note: asm.sourceSyncedAt ? `Synced ${new Date(asm.sourceSyncedAt).toLocaleDateString("en-US")}` : "Based on formula", color: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-600", labelColor: "text-emerald-600" },
          ].map((card) => (
          <div key={card.label} className={`rounded-3xl border p-5 shadow-panel ${card.color}`}>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${card.labelColor}`}>{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">KPI Breakdown</h2>
          <div className="mt-6 space-y-3">
            {[
              { label: "Revenue", value: `${scorecard.revenueScore}/65`, detail: `${scorecard.revenuePct}% revenue attainment`, color: "border-sky-100 bg-sky-50", badge: "bg-sky-100 text-sky-700" },
              { label: "Dealers Code", value: `${scorecard.customerScore}/15`, detail: `${asm.newCustomersActual} dealer codes`, color: "border-violet-100 bg-violet-50", badge: "bg-violet-100 text-violet-700" },
              { label: "Key SKU", value: `${scorecard.keySkuScore}/5`, detail: keyChecks.map((item) => `${item.code} ${item.actual}/${item.target}`).join(" · "), color: "border-sky-100 bg-sky-50", badge: "bg-sky-100 text-sky-700" },
              { label: "Clearstock", value: `${scorecard.clearstockScore}/10`, detail: clearChecks.map((item) => `${item.code} ${item.actual}/${item.target}`).join(" · "), color: "border-rose-100 bg-rose-50", badge: "bg-rose-100 text-rose-700" },
              { label: "Discipline", value: `${scorecard.manualScore}/5`, detail: "Entered manually by the manager", color: "border-amber-100 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl border px-4 py-4 ${item.color}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.badge}`}>{item.value}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">Manager Review</h2>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Manager note</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{asm.managerNote}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Discipline</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{scorecard.manualScore}/5</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Reporting quality</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{scorecard.reportingScore}/5</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold text-slate-900">SKU Key Detail</h2>
          <div className="mt-6 space-y-3">
            {keyChecks.map((item) => {
              const passed = item.actual >= item.threshold;
              return (
                <div key={item.code} className={`rounded-2xl border px-4 py-4 ${passed ? "border-sky-100 bg-sky-50" : "border-amber-100 bg-amber-50"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        <span className="font-semibold text-sky-600">{item.code}</span> · {item.name}
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
          <h2 className="text-2xl font-semibold text-slate-900">Clearstock Detail</h2>
          <div className="mt-6 space-y-3">
            {clearChecks.map((item) => {
              const passed = item.actual >= item.threshold;
              return (
                <div key={item.code} className={`rounded-2xl border px-4 py-4 ${passed ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        <span className="font-semibold text-rose-500">{item.code}</span> · {item.name}
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

      {/* ── Income Breakdown ─────────────────────────────────── */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Thu nhập tháng</p>
            <h2 className="text-2xl font-semibold text-slate-900">Income Breakdown</h2>
          </div>
          {isProbation && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Probation · ×85%
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Base Salary",
              value: `${fmt(income.baseSalary)} đ`,
              note: scorecard.revenuePct < 50
                ? `${scorecard.revenuePct}% × 12,000,000${isProbation ? " × 85%" : ""}`
                : isProbation ? "12,000,000 × 85%" : "12,000,000",
              color: "border-sky-100 bg-sky-50",
              badge: "text-sky-700",
            },
            {
              label: "Allowance",
              value: `${fmt(income.allowance)} đ`,
              note: scorecard.revenuePct < 50
                ? `${scorecard.revenuePct}% × 5,000,000${isProbation ? " × 85%" : ""}`
                : isProbation ? "5,000,000 × 85%" : "5,000,000",
              color: "border-violet-100 bg-violet-50",
              badge: "text-violet-700",
            },
            {
              label: "KPI Salary",
              value: `${fmt(income.kpiSalary)} đ`,
              note: `${scorecard.payout}M · ${scorecard.total}/100 pts`,
              color: "border-emerald-100 bg-emerald-50",
              badge: "text-emerald-700",
            },
            {
              label: "Total Income",
              value: `${fmt(income.total)} đ`,
              note: isProbation ? "Probation rate applied" : "Base + allowance + KPI",
              color: "border-slate-900 bg-slate-950",
              badge: "text-white",
              dark: true,
            },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.color}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${card.dark ? "text-slate-400" : "text-slate-500"}`}>{card.label}</p>
              <p className={`mt-3 text-xl font-semibold leading-tight ${card.dark ? "text-white" : "text-slate-900"}`}>{card.value}</p>
              <p className={`mt-2 text-xs ${card.dark ? "text-slate-400" : "text-slate-500"}`}>{card.note}</p>
            </div>
          ))}
        </div>

        {/* Revenue achievement table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">% Hoàn thành</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Điểm doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: "≥ 100%", pts: 65 },
                { range: "90 – 99%", pts: 55 },
                { range: "80 – 89%", pts: 45 },
                { range: "50 – 79%", pts: 25 },
                { range: "< 50%", pts: 0 },
              ].map((row) => {
                const active = row.pts === scorecard.revenueScore;
                return (
                  <tr key={row.range} className={`border-b border-slate-100 last:border-0 ${active ? "bg-sky-50" : ""}`}>
                    <td className={`px-4 py-3 font-medium ${active ? "text-sky-700" : "text-slate-700"}`}>{row.range}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${active ? "text-sky-700" : "text-slate-500"}`}>
                      {row.pts}{active && <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[10px]">hiện tại</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
