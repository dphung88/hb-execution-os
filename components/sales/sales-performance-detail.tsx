import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, ClipboardCheck, Database, UserCircle2 } from "lucide-react";

import { salesKpiProducts } from "@/lib/demo-data";
import { type SalesAsm, getAsmScorecard, getSalesPeriodLabel } from "@/lib/sales/scorecards";

type SalesPerformanceDetailProps = {
  asm: SalesAsm;
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
          Quay lai bang KPI
        </Link>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
              ASM detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{asm.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {asm.id} · {asm.region} · Chu ky {periodLabel}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Tong KPI", value: `${scorecard.total}/100` },
                { label: "Luong KPI", value: `${scorecard.payout}M` },
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
          { icon: Database, label: "Doanh thu", value: `${asm.revenueActual}/${asm.revenueTarget}M`, note: `${scorecard.revenuePct}% dat muc tieu` },
          { icon: ClipboardCheck, label: "KH moi", value: `${asm.newCustomersActual}/${asm.newCustomersTarget}`, note: `${scorecard.customerScore}/15 diem` },
          { icon: UserCircle2, label: "Manager", value: asm.manager, note: "Danh gia thuc dia" },
          { icon: BadgeDollarSign, label: "Cong thuc luong", value: "4.1% x DT target x he so", note: "Giong site KPI cu" }
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
          <h2 className="text-2xl font-semibold text-slate-900">Breakdown theo muc KPI</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: "3.1 Doanh thu", value: `${scorecard.revenueScore}/65`, detail: `${scorecard.revenuePct}% doanh thu` },
              { label: "3.2 Khach hang moi", value: `${scorecard.customerScore}/15`, detail: `${asm.newCustomersActual} KH moi` },
              { label: "3.3 SKU Key", value: `${scorecard.keySkuScore}/5`, detail: "Ca HB031 va HB035 phai dat >=50%" },
              { label: "3.4 Clearstock", value: `${scorecard.clearstockScore}/10`, detail: "HB006 va HB034 theo nguong 80%" },
              { label: "3.5 Noi quy", value: `${scorecard.manualScore}/5`, detail: "Manager nhap tay" }
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
          <h2 className="text-2xl font-semibold text-slate-900">Nhan xet manager</h2>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Manager note</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{asm.managerNote}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Noi quy</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{scorecard.manualScore}/5</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chat luong bao cao</p>
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
                      {passed ? "Dat" : "Chua dat"}
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
                      {passed ? "Dat" : "Chua dat"}
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
