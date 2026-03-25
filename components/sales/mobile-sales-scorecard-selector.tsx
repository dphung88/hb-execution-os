"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

function getHealthTone(total: number) {
  if (total >= 80) return "text-emerald-700 bg-emerald-50";
  if (total >= 60) return "text-amber-700 bg-amber-50";
  return "text-rose-700 bg-rose-50";
}

type ScorecardRow = {
  id: string;
  name: string;
  periodLabel: string;
  revenueActual: number;
  revenueTarget: number;
  newCustomersActual: number;
  newCustomersTarget: number;
  keySkuTargets: Array<{ code: string; actual: number; target: number }>;
  clearstockTargets: Array<{ code: string; actual: number; target: number }>;
  scorecard: {
    total: number;
    revenueScore: number;
    revenuePct: number;
    customerScore: number;
    keySkuScore: number;
    clearstockScore: number;
    manualScore: number;
    payout: number;
  };
};

type MobileSalesScorecardSelectorProps = {
  scorecards: ScorecardRow[];
  selectedPeriod: string;
};

export function MobileSalesScorecardSelector({
  scorecards,
  selectedPeriod,
}: MobileSalesScorecardSelectorProps) {
  const [selectedId, setSelectedId] = useState(scorecards[0]?.id ?? "");
  const [listOpen, setListOpen] = useState(false);

  const selected = scorecards.find((s) => s.id === selectedId) ?? scorecards[0];

  if (!selected) return null;

  return (
    <>
      {/* ASM selector */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ASM Selector</p>
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
          >
            {listOpen ? "Hide List" : "Change ASM"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setListOpen((o) => !o)}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition"
        >
          <span className="text-sm font-semibold text-slate-900">{selected.name}</span>
          <span className="ml-2 text-xs text-slate-500">{selected.id}</span>
          <span className={`ml-3 inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${getHealthTone(selected.scorecard.total)}`}>
            {selected.scorecard.total} pts
          </span>
        </button>

        {listOpen ? (
          <div className="mt-3 grid gap-2">
            {scorecards.map((asm) => (
              <button
                key={asm.id}
                type="button"
                onClick={() => {
                  setSelectedId(asm.id);
                  setListOpen(false);
                }}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedId === asm.id
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span>{asm.name} · {asm.id}</span>
                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedId === asm.id ? "bg-white/20 text-white" : getHealthTone(asm.scorecard.total)
                }`}>
                  {asm.scorecard.total} pts
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Selected ASM detail */}
      <div className="mt-6 space-y-4 md:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">{selected.name}</p>
              <p className="mt-1 text-xs text-slate-500">{selected.id}</p>
            </div>
            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getHealthTone(selected.scorecard.total)}`}>
              {selected.scorecard.total} pts
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sales Revenue</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selected.revenueActual}/{selected.revenueTarget}M</p>
              <p className="mt-1 text-xs text-slate-500">{selected.scorecard.revenueScore}/65 · {selected.scorecard.revenuePct}% target</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dealers Code</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selected.newCustomersActual}/{selected.newCustomersTarget}</p>
              <p className="mt-1 text-xs text-slate-500">{selected.scorecard.customerScore}/15</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Key SKU</p>
              <div className="mt-2 space-y-1 text-sm font-semibold text-slate-900">
                {selected.keySkuTargets.map((item) => (
                  <div key={item.code}>{item.code} {item.actual}/{item.target}</div>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{selected.scorecard.keySkuScore}/5</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Clearstock</p>
              <div className="mt-2 space-y-1 text-sm font-semibold text-slate-900">
                {selected.clearstockTargets.map((item) => (
                  <div key={item.code}>{item.code} {item.actual}/{item.target}</div>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{selected.scorecard.clearstockScore}/10</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Discipline</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selected.scorecard.manualScore}/5</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">KPI Payout</p>
              <p className="mt-2 text-sm font-semibold text-brand-700">{selected.scorecard.payout}M</p>
            </div>
          </div>

          <Link
            href={`/sales-performance/${selected.id}?period=${selectedPeriod}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            View Detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
