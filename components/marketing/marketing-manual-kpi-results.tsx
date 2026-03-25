"use client";

import { useEffect, useMemo, useState } from "react";
import { PenSquare, TrendingUp } from "lucide-react";

import { marketingHeadcountPlan } from "@/lib/demo-data";
import { getDefaultMarketingManualInputs, type MarketingManualInputs } from "@/lib/marketing/kpi-templates";
import { buildMarketingRoleResults } from "@/lib/marketing/scoring";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";
import {
  saveMarketingManualInputsAction,
  saveMarketingTargetsAction,
} from "@/app/(app)/marketing-performance/results/actions";

const STORAGE_KEY = "hb-marketing-manual-kpi-inputs-v1";

function formatInput(value: number, unit: string) {
  if (unit === "VND") return value.toLocaleString("en-US");
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function formatDisplay(value: number, unit: string) {
  if (unit === "VND") return `${Math.round(value).toLocaleString("en-US")} VND`;
  if (unit === "visits") return `${Math.round(value).toLocaleString("en-US")} visits`;
  if (unit === "posts" || unit === "items") return `${value} ${unit}`;
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))} ${unit}`;
}

function formatPlainNumber(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function parseInputValue(raw: string) {
  const normalized = raw.replace(/,/g, "").trim();
  const next = Number(normalized || 0);
  return Number.isFinite(next) ? next : 0;
}

type Props = {
  tasks?: MarketingTaskRecord[];
  monthKey?: string;
  initialInputs?: MarketingManualInputs;
  source?: "supabase" | "local";
  mode?: "targets" | "results";
};

export function MarketingManualKpiResults({
  tasks = [],
  monthKey = "2025-04",
  initialInputs,
  source = "local",
  mode = "results",
}: Props) {
  const [inputs, setInputs] = useState<MarketingManualInputs>(() => initialInputs ?? getDefaultMarketingManualInputs());

  useEffect(() => {
    setInputs(initialInputs ?? getDefaultMarketingManualInputs());
  }, [initialInputs]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_KEY}:${monthKey}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MarketingManualInputs;
      setInputs((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore malformed local state
    }
  }, [monthKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:${monthKey}`, JSON.stringify(inputs));
    } catch {
      // ignore browser storage failures
    }
  }, [inputs, monthKey]);

  const roleResults = useMemo(() => {
    return buildMarketingRoleResults(inputs, tasks);
  }, [inputs, tasks]);
  const isTargetMode = mode === "targets";

  const departmentRoleSummary = useMemo(() => {
    return marketingHeadcountPlan.map((role) => {
      const normalizedRole = role.role.toLowerCase();
      const mappedRole = roleResults.find((item) => item.role.toLowerCase().includes(normalizedRole) || normalizedRole.includes(item.role.toLowerCase()));
      const supportRole =
        normalizedRole.includes("graphic") ||
        normalizedRole.includes("media") ||
        normalizedRole.includes("ai") ||
        normalizedRole.includes("junior") ||
        normalizedRole.includes("manager");

      const linkedTasks = tasks.filter((task) => {
        const owner = task.owner.toLowerCase();
        if (normalizedRole.includes("digital")) return owner.includes("content");
        if (normalizedRole.includes("graphic")) return owner.includes("designer");
        if (normalizedRole.includes("media")) return owner.includes("editor");
        if (normalizedRole.includes("ai")) return owner.includes("ai");
        return false;
      });

      return {
        role: role.role,
        contribution: supportRole ? "Support" : "Revenue",
        estimated: role.estimated,
        actual: role.actual,
        remaining: role.remaining,
        workbookScore: mappedRole?.workbookScore ?? null,
        executionScore: mappedRole?.executionScore ?? 0,
        payoutBase: mappedRole?.payoutBase ?? 0,
        payoutPercent: mappedRole?.payoutPercent ?? 0,
        payoutAmount: mappedRole?.payoutAmount ?? 0,
        linkedTasks: linkedTasks.length,
        sections: mappedRole?.sections.length ?? 0,
        manualMetrics: mappedRole?.sections.reduce((sum, section) => sum + section.metrics.length, 0) ?? 0,
      };
    });
  }, [roleResults, tasks]);

  return (
    <>
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <PenSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Manual KPI inputs</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isTargetMode ? "Role KPI targets" : "Role KPI outcomes"}
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {isTargetMode
              ? "Set KPI targets for each role here. Sales revenue and channel metrics can be auto-fed later, while the remaining criteria stay manual."
              : "Confirm actual KPI outcomes here. Targets stay fixed from the target setup page, while actual values are entered and saved for scoring and payout."}
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {source === "supabase" ? "Loaded from Supabase" : "Browser draft"}
            </span>
            <form action={isTargetMode ? saveMarketingTargetsAction : saveMarketingManualInputsAction}>
              <input type="hidden" name="month_key" value={monthKey} />
              <input type="hidden" name="payload" value={JSON.stringify(inputs)} />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isTargetMode ? "Save targets" : "Save outcomes"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {roleResults.map((role) => (
            <div key={role.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{role.role}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Workbook score {role.workbookScore}/100
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Task execution {role.executionScore}/40
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Payout {role.payoutPercent}% / {formatPlainNumber(role.payoutAmount)} VND
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {role.sections.map((section) => (
                  <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[15px] font-semibold text-slate-900">{section.name}</p>
                        <p className="mt-1 text-xs text-slate-500">Weight {section.weightLabel}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {section.sectionScore}/{section.sectionMax}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {section.metrics.map((metric) => {
                        const key = `${role.id}:${metric.id}`;
                        const entry = inputs[key];
                        return (
                          <div key={metric.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{metric.name}</p>
                                <p className="mt-1 text-[11px] tracking-[0.14em] text-slate-400">
                                  Max score {metric.maxScore} · {metric.unit}
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {metric.score}/{metric.maxScore}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">Target</span>
                                {isTargetMode ? (
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formatInput(entry?.target ?? metric.target, metric.unit)}
                                    onChange={(event) => {
                                      const next = parseInputValue(event.target.value);
                                      setInputs((prev) => ({
                                        ...prev,
                                        [key]: {
                                          target: next,
                                          actual: prev[key]?.actual ?? 0,
                                        },
                                      }));
                                    }}
                                    className="mt-1.5 h-9 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                  />
                                ) : (
                                  <div className="mt-1.5 flex h-9 items-center rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900">
                                    {formatInput(entry?.target ?? metric.target, metric.unit)}
                                  </div>
                                )}
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">Actual</span>
                                {isTargetMode ? (
                                  <div className="mt-1.5 flex h-9 items-center rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
                                    {formatInput(entry?.actual ?? 0, metric.unit)}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formatInput(entry?.actual ?? 0, metric.unit)}
                                    onChange={(event) => {
                                      const next = parseInputValue(event.target.value);
                                      setInputs((prev) => ({
                                        ...prev,
                                        [key]: {
                                          target: prev[key]?.target ?? metric.target,
                                          actual: next,
                                        },
                                      }));
                                    }}
                                    className="mt-1.5 h-9 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                  />
                                )}
                              </label>
                            </div>

                            <div className="mt-2.5 grid gap-1.5 text-xs text-slate-500 sm:grid-cols-3">
                              <p>Target {formatDisplay(entry?.target ?? metric.target, metric.unit)}</p>
                              <p>Actual {formatDisplay(entry?.actual ?? 0, metric.unit)}</p>
                              <p>Achievement {Math.round(metric.ratio * 100)}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Results by role</p>
            <h2 className="text-2xl font-semibold text-slate-900">Role summary across the department</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {departmentRoleSummary.map((role) => (
            <div key={role.role} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{role.role}</p>
                  <p className="mt-1 text-sm text-slate-500">{role.contribution} role</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {role.workbookScore !== null ? `${role.workbookScore}/100` : "Support role"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Estimated</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.estimated)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Actual</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.actual)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Remaining</span>
                  <span className={`font-semibold ${role.remaining < 0 ? "text-rose-700" : "text-slate-900"}`}>{formatPlainNumber(role.remaining)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Task footprint</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.linkedTasks)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Execution score</span>
                  <span className="font-semibold text-slate-900">{role.executionScore}/40</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Payout base</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.payoutBase)} VND</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Payout result</span>
                  <span className="font-semibold text-slate-900">{role.payoutPercent}% / {formatPlainNumber(role.payoutAmount)} VND</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Sections</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.sections)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Manual metrics</span>
                  <span className="font-semibold text-slate-900">{formatPlainNumber(role.manualMetrics)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
