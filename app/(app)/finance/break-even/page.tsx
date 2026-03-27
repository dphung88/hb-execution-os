"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────
type BEPInputs = {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number;
  actualUnits: number;
};

// ── Helper ─────────────────────────────────────────────────
function calcBEP(inputs: BEPInputs) {
  const { fixedCost: fc, variableCostPerUnit: vc, sellingPricePerUnit: sp, targetProfit: tp, actualUnits: au } = inputs;
  const cm = sp - vc;
  const cmRatio = sp > 0 ? cm / sp : 0;
  const bepUnits = cm > 0 ? fc / cm : 0;
  const bepRevenue = cmRatio > 0 ? fc / cmRatio : 0;
  const targetUnits = cm > 0 ? (fc + tp) / cm : 0;
  const actualRevenue = au * sp;
  const marginOfSafety = actualRevenue - bepRevenue;
  const mosPercent = bepRevenue > 0 ? (marginOfSafety / bepRevenue) * 100 : 0;
  const status: "below" | "at" | "above" =
    au >= bepUnits + 1 ? "above" : au >= bepUnits - 1 ? "at" : "below";
  return { cm, cmRatio, bepUnits, bepRevenue, targetUnits, actualRevenue, marginOfSafety, mosPercent, status };
}

const statusConfig = {
  below: { label: "Below BEP",  badge: "bg-rose-100 text-rose-700",    icon: TrendingDown },
  at:    { label: "At BEP",     badge: "bg-amber-100 text-amber-700",   icon: Minus        },
  above: { label: "Above BEP",  badge: "bg-emerald-100 text-emerald-700", icon: TrendingUp },
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  : n.toFixed(0);

// ── Input Row ────────────────────────────────────────────────
function InputRow({ label, field, value, onChange, hint }: {
  label: string; field: keyof BEPInputs; value: number;
  onChange: (f: keyof BEPInputs, v: number) => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
        placeholder="0"
        className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400"
      />
      {hint && <p className="mt-1 text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ── Result Card ──────────────────────────────────────────────
function ResultCard({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "border border-sky-400/30 bg-sky-400/10" : "border border-white/8 bg-white/5"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-semibold ${highlight ? "text-sky-300" : "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function BreakEvenPage() {
  const [inputs, setInputs] = useState<BEPInputs>({
    fixedCost: 0, variableCostPerUnit: 0, sellingPricePerUnit: 0, targetProfit: 0, actualUnits: 0,
  });

  const result = useMemo(() => calcBEP(inputs), [inputs]);
  const onChange = (field: keyof BEPInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  const { label: statusLabel, badge: statusBadge, icon: StatusIcon } = statusConfig[result.status];
  const maxDisplay = Math.max(result.bepUnits * 1.5, inputs.actualUnits * 1.1, 1);
  const bepPct = Math.min((result.bepUnits / maxDisplay) * 100, 100);
  const actualPct = Math.min((inputs.actualUnits / maxDisplay) * 100, 100);

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Finance · Break-Even Analysis</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              How many units do we need<br className="hidden sm:block" /> to break even?
            </h1>
            <p className="mt-3 text-sm text-slate-400">Enter your cost structure — results update in real time.</p>
          </div>
          <Link
            href="/finance"
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Finance Dashboard
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── LEFT: Inputs ── */}
        <section className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300 mb-5">Input — Cost Structure</p>
          <div className="space-y-4">
            <InputRow label="Fixed Costs (FC)" field="fixedCost" value={inputs.fixedCost} onChange={onChange} hint="Rent, salaries, depreciation, insurance…" />
            <InputRow label="Variable Cost / Unit (VC)" field="variableCostPerUnit" value={inputs.variableCostPerUnit} onChange={onChange} hint="Raw material, packaging, commission per unit" />
            <InputRow label="Selling Price / Unit (SP)" field="sellingPricePerUnit" value={inputs.sellingPricePerUnit} onChange={onChange} hint="Average net selling price after discount" />
            <InputRow label="Target Profit (optional)" field="targetProfit" value={inputs.targetProfit} onChange={onChange} hint="Profit you want to achieve this period" />
            <InputRow label="Actual Units Sold" field="actualUnits" value={inputs.actualUnits} onChange={onChange} hint="Current period — used to compute margin of safety" />
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Contribution Margin / Unit</span>
              <span className={`font-semibold ${result.cm >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{fmt(result.cm)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">CM Ratio</span>
              <span className="font-semibold text-white">{(result.cmRatio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </section>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-4">
          {/* Status banner */}
          <div className={`flex items-center gap-3 rounded-3xl border px-5 py-4 ${statusBadge}`}>
            <StatusIcon className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{statusLabel}</p>
              <p className="text-xs opacity-75">
                {result.status === "above"
                  ? `${fmt(inputs.actualUnits - result.bepUnits)} units above break-even`
                  : result.status === "at"
                  ? "Right at break-even point"
                  : result.bepUnits > 0
                  ? `${fmt(result.bepUnits - inputs.actualUnits)} more units needed to break even`
                  : "Enter cost structure to calculate"}
              </p>
            </div>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="BEP (Units)"   value={fmt(result.bepUnits)}   sub="units to cover fixed costs" highlight />
            <ResultCard label="BEP (Revenue)" value={fmt(result.bepRevenue)} sub="revenue at break-even" />
            <ResultCard label="Target Units"  value={fmt(result.targetUnits)} sub="for target profit" />
            <ResultCard label="Actual Revenue" value={fmt(result.actualRevenue)} sub="current period" />
            <ResultCard
              label="Margin of Safety"
              value={fmt(Math.abs(result.marginOfSafety))}
              sub={`${result.mosPercent >= 0 ? "+" : "–"}${Math.abs(result.mosPercent).toFixed(1)}% vs BEP`}
            />
            <ResultCard label="CM Ratio" value={`${(result.cmRatio * 100).toFixed(1)}%`} sub="gross contribution per unit sold" />
          </div>

          {/* Visual bar */}
          {result.bepUnits > 0 && (
            <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">Units Progress vs BEP</p>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>BEP</span><span>{fmt(result.bepUnits)} units</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-slate-400 transition-all" style={{ width: `${bepPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Actual</span><span>{fmt(inputs.actualUnits)} units</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full transition-all ${result.status === "above" ? "bg-emerald-500" : result.status === "at" ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${actualPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
