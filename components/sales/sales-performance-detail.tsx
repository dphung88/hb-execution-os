import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, ClipboardCheck, Database, UserCircle2 } from "lucide-react";

import { saveSalesReviewAction, saveSalesTargetsAction } from "@/app/(app)/sales-performance/[id]/actions";
import type { SalesAsmResolved } from "@/lib/sales/queries";
import { getAsmScorecard, getSalesPeriodLabel } from "@/lib/sales/scorecards";

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
};

function getStatusColor(passed: boolean) {
  return passed ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";
}

function getSkuSuffix(value: unknown, fallback: number) {
  const raw = String(value ?? "").toUpperCase();
  const digits = raw.replace(/^HB/i, "").replace(/\D/g, "");
  const resolved = Number(digits || fallback);

  if (Number.isNaN(resolved)) {
    return fallback;
  }

  return Math.max(1, Math.min(999, resolved));
}

export function SalesPerformanceDetail({
  asm,
  selectedPeriod,
  canEdit,
  target,
  review,
  saveStatus,
  errorStatus,
}: SalesPerformanceDetailProps) {
  const scorecard = getAsmScorecard(asm);
  const periodLabel = getSalesPeriodLabel(asm.periodKey);
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
        <Link
          href={`/sales-performance?period=${selectedPeriod}`}
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
              {asm.id} · Period {periodLabel}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              Live data from Supabase
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
          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-700">Monthly targets</p>
                <h2 className="text-2xl font-semibold text-slate-900">Set target values outside ERP</h2>
              </div>
              {saveStatus === "targets" ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Targets saved
                </span>
              ) : null}
            </div>

            <form action={saveSalesTargetsAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="asm_id" value={asm.id} />
              <input type="hidden" name="period" value={selectedPeriod} />
              {[
                { name: "revenue_target", label: "Sales Revenue (million VND)", value: target?.revenue_target ?? asm.revenueTarget, type: "number" },
                { name: "new_customers_target", label: "Dealers Code", value: target?.new_customers_target ?? asm.newCustomersTarget, type: "number" },
              ].map((field) => (
                <label key={field.name} className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{field.label}</span>
                  <input
                    type={field.type}
                    step="1"
                    name={field.name}
                    defaultValue={field.value}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                  />
                </label>
              ))}
              <div className="md:col-span-2 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Key SKU</p>
                  <div className="mt-3 grid gap-3">
                    {[
                      {
                        codeName: "key_sku_code_1",
                        codeValue: getSkuSuffix(target?.key_sku_code_1 ?? asm.keySkuTargets[0]?.code ?? "HB031", 31),
                        qtyName: "hb031_target",
                        qtyValue: target?.hb031_target ?? asm.keySkuTargets[0]?.target ?? 0,
                      },
                      {
                        codeName: "key_sku_code_2",
                        codeValue: getSkuSuffix(target?.key_sku_code_2 ?? asm.keySkuTargets[1]?.code ?? "HB035", 35),
                        qtyName: "hb035_target",
                        qtyValue: target?.hb035_target ?? asm.keySkuTargets[1]?.target ?? 0,
                      },
                    ].map((field) => (
                      <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Code</span>
                          <div className="mt-1 flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-brand-400">
                            <div className="flex w-[84px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                              HB
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              step="1"
                              name={field.codeName}
                              defaultValue={field.codeValue}
                              className="h-full min-w-0 flex-1 bg-white px-4 pr-10 text-left text-sm tabular-nums text-slate-900 outline-none"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Quantity</span>
                          <input
                            type="number"
                            step="1"
                            name={field.qtyName}
                            defaultValue={field.qtyValue}
                            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Clearstock</p>
                  <div className="mt-3 grid gap-3">
                    {[
                      {
                        codeName: "clearstock_code_1",
                        codeValue: getSkuSuffix(target?.clearstock_code_1 ?? asm.clearstockTargets[0]?.code ?? "HB006", 6),
                        qtyName: "hb006_target",
                        qtyValue: target?.hb006_target ?? asm.clearstockTargets[0]?.target ?? 0,
                      },
                      {
                        codeName: "clearstock_code_2",
                        codeValue: getSkuSuffix(target?.clearstock_code_2 ?? asm.clearstockTargets[1]?.code ?? "HB034", 34),
                        qtyName: "hb034_target",
                        qtyValue: target?.hb034_target ?? asm.clearstockTargets[1]?.target ?? 0,
                      },
                    ].map((field) => (
                      <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Code</span>
                          <div className="mt-1 flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-brand-400">
                            <div className="flex w-[84px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                              HB
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              step="1"
                              name={field.codeName}
                              defaultValue={field.codeValue}
                              className="h-full min-w-0 flex-1 bg-white px-4 pr-10 text-left text-sm tabular-nums text-slate-900 outline-none"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Quantity</span>
                          <input
                            type="number"
                            step="1"
                            name={field.qtyName}
                            defaultValue={field.qtyValue}
                            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 md:col-span-2"
              >
                Save monthly targets
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-700">Manager review</p>
                <h2 className="text-2xl font-semibold text-slate-900">Save discipline and reporting notes</h2>
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
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Discipline score</span>
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
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reporting score</span>
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
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Manager note</span>
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
            { icon: Database, label: "Revenue", value: `${asm.revenueActual}/${asm.revenueTarget}M`, note: `${scorecard.revenuePct}% of target` },
            { icon: ClipboardCheck, label: "Dealers Code", value: `${asm.newCustomersActual}/${asm.newCustomersTarget}`, note: `${scorecard.customerScore}/15 points` },
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
              { label: "3.2 Dealers Code", value: `${scorecard.customerScore}/15`, detail: `${asm.newCustomersActual} dealer codes` },
              { label: "3.3 Key SKU", value: `${scorecard.keySkuScore}/5`, detail: keyChecks.map((item) => `${item.code} ${item.actual}/${item.target}`).join(" · ") },
              { label: "3.4 Clearstock", value: `${scorecard.clearstockScore}/10`, detail: clearChecks.map((item) => `${item.code} ${item.actual}/${item.target}`).join(" · ") },
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
