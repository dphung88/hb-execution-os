"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NumInput } from "@/components/sales/num-input";

type MobileSalesTargetRow = {
  id: string;
  name: string;
  region: string;
  saved: boolean;
  target: {
    revenue_target: number;
    new_customers_target: number;
    key_sku_code_1: string;
    key_sku_code_2: string;
    clearstock_code_1: string;
    clearstock_code_2: string;
    hb031_target: number;
    hb035_target: number;
    hb006_target: number;
    hb034_target: number;
  };
};

type MobileSalesTargetsSelectorProps = {
  asms: MobileSalesTargetRow[];
  selectedPeriod: string;
  initialAsmId: string;
  saveAction: (formData: FormData) => void | Promise<void>;
};

export function MobileSalesTargetsSelector({
  asms,
  selectedPeriod,
  initialAsmId,
  saveAction,
}: MobileSalesTargetsSelectorProps) {
  const [selectedAsmId, setSelectedAsmId] = useState(initialAsmId);
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    setSelectedAsmId(initialAsmId);
    setSelectorOpen(false);
  }, [initialAsmId]);

  const selectedAsm = asms.find((asm) => asm.id === selectedAsmId) ?? asms[0];

  if (!selectedAsm) {
    return null;
  }

  return (
    <>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ASM selector</p>
          <button
            type="button"
            onClick={() => setSelectorOpen((open) => !open)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
          >
            {selectorOpen ? "Hide list" : "Change ASM"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSelectorOpen((open) => !open)}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition"
        >
          {selectedAsm.name} · {selectedAsm.id}
        </button>

        {selectorOpen ? (
          <div className="mt-3 grid gap-2">
            {asms.map((asm) => (
              <button
                key={asm.id}
                type="button"
                onClick={() => {
                  setSelectedAsmId(asm.id);
                  setSelectorOpen(false);
                }}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedAsmId === asm.id
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {asm.name} · {asm.id}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        <form
          action={saveAction}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="asm_id" value={selectedAsm.id} />
          <input type="hidden" name="period" value={selectedPeriod} />

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedAsm.name}</p>
                <p className="text-xs text-slate-500">{selectedAsm.id} · {selectedAsm.region}</p>
              </div>
              {selectedAsm.saved ? (
                <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Saved
                </span>
              ) : null}
            </div>

            {/* Revenue + Dealers — 2 cols */}
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">Sales Target</span>
                <NumInput
                  name="revenue_target"
                  defaultValue={selectedAsm.target.revenue_target}
                  className="mt-1 h-9 w-full rounded-2xl border border-sky-100 bg-sky-50 px-3 text-xs text-slate-900 outline-none transition focus:border-sky-400"
                />
                <span className="mt-1 block text-[10px] text-slate-400">Unit: million VND</span>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">Dealers Code</span>
                <input
                  type="number"
                  name="new_customers_target"
                  defaultValue={selectedAsm.target.new_customers_target}
                  className="mt-1 h-9 w-full rounded-2xl border border-violet-100 bg-violet-50 px-3 text-xs text-slate-900 outline-none transition focus:border-violet-400"
                />
              </label>
            </div>

            {/* Key SKU — 2x2 grid (Code | Qty per row) */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">Key SKU</p>
              <div className="mt-2 space-y-2">
                {[
                  { codeName: "key_sku_code_1", codeValue: selectedAsm.target.key_sku_code_1, qtyName: "hb031_target", qtyValue: selectedAsm.target.hb031_target },
                  { codeName: "key_sku_code_2", codeValue: selectedAsm.target.key_sku_code_2, qtyName: "hb035_target", qtyValue: selectedAsm.target.hb035_target },
                ].map((field) => (
                  <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Code</span>
                      <input type="text" name={field.codeName} defaultValue={field.codeValue}
                        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs uppercase text-slate-900 outline-none transition focus:border-brand-400" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Quantity</span>
                      <input type="number" name={field.qtyName} defaultValue={field.qtyValue}
                        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none transition focus:border-brand-400" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clearstock — 2x2 grid */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-600">Clearstock</p>
              <div className="mt-2 space-y-2">
                {[
                  { codeName: "clearstock_code_1", codeValue: selectedAsm.target.clearstock_code_1, qtyName: "hb006_target", qtyValue: selectedAsm.target.hb006_target },
                  { codeName: "clearstock_code_2", codeValue: selectedAsm.target.clearstock_code_2, qtyName: "hb034_target", qtyValue: selectedAsm.target.hb034_target },
                ].map((field) => (
                  <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Code</span>
                      <input type="text" name={field.codeName} defaultValue={field.codeValue}
                        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs uppercase text-slate-900 outline-none transition focus:border-brand-400" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Quantity</span>
                      <input type="number" name={field.qtyName} defaultValue={field.qtyValue}
                        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none transition focus:border-brand-400" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save targets
              </button>
              <Link
                href={`/sales-performance/${selectedAsm.id}?period=${selectedPeriod}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                Open ASM detail
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
