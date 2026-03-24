"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MobileSalesTargetRow = {
  id: string;
  name: string;
  region: string;
  revenueActualLabel: string;
  dealersActualLabel: string;
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
  const detailRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    setSelectedAsmId(initialAsmId);
  }, [initialAsmId]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [selectedAsmId]);

  const selectedAsm = asms.find((asm) => asm.id === selectedAsmId) ?? asms[0];

  if (!selectedAsm) {
    return null;
  }

  return (
    <>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">ASM selector</p>
        <div className="mt-3 grid gap-2">
          {asms.map((asm) => (
            <button
              key={asm.id}
              type="button"
              onClick={() => setSelectedAsmId(asm.id)}
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
      </div>

      <div ref={detailRef} className="mt-6 space-y-4 scroll-mt-6 md:hidden">
        <form
          action={saveAction}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="asm_id" value={selectedAsm.id} />
          <input type="hidden" name="period" value={selectedPeriod} />

          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{selectedAsm.name}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedAsm.id}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedAsm.region}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                Sales Revenue: {selectedAsm.revenueActualLabel}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                Dealers code: {selectedAsm.dealersActualLabel}
              </p>
              {selectedAsm.saved ? (
                <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Row saved
                </span>
              ) : null}
            </div>

            <div className="grid gap-3">
              {[
                {
                  name: "revenue_target",
                  label: "Sales Target",
                  value: selectedAsm.target.revenue_target,
                  note: "Unit: million VND",
                },
                {
                  name: "new_customers_target",
                  label: "Dealers Code",
                  value: selectedAsm.target.new_customers_target,
                },
              ].map((field) => (
                <label key={field.name} className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    defaultValue={field.value}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                  />
                  {"note" in field ? (
                    <span className="mt-2 block text-xs text-slate-500">{field.note}</span>
                  ) : null}
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Key SKU</p>
                <div className="mt-3 grid gap-3">
                  {[
                    {
                      codeName: "key_sku_code_1",
                      codeValue: selectedAsm.target.key_sku_code_1,
                      qtyName: "hb031_target",
                      qtyValue: selectedAsm.target.hb031_target,
                    },
                    {
                      codeName: "key_sku_code_2",
                      codeValue: selectedAsm.target.key_sku_code_2,
                      qtyName: "hb035_target",
                      qtyValue: selectedAsm.target.hb035_target,
                    },
                  ].map((field) => (
                    <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Code</span>
                        <input
                          type="text"
                          name={field.codeName}
                          defaultValue={field.codeValue}
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Quantity</span>
                        <input
                          type="number"
                          name={field.qtyName}
                          defaultValue={field.qtyValue}
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Clearstock</p>
                <div className="mt-3 grid gap-3">
                  {[
                    {
                      codeName: "clearstock_code_1",
                      codeValue: selectedAsm.target.clearstock_code_1,
                      qtyName: "hb006_target",
                      qtyValue: selectedAsm.target.hb006_target,
                    },
                    {
                      codeName: "clearstock_code_2",
                      codeValue: selectedAsm.target.clearstock_code_2,
                      qtyName: "hb034_target",
                      qtyValue: selectedAsm.target.hb034_target,
                    },
                  ].map((field) => (
                    <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Code</span>
                        <input
                          type="text"
                          name={field.codeName}
                          defaultValue={field.codeValue}
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Quantity</span>
                        <input
                          type="number"
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
