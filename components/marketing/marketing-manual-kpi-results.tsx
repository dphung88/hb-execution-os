"use client";

import { useEffect, useMemo, useState } from "react";
import { PenSquare, TrendingUp, Users } from "lucide-react";

import { getMarketingExecutionScore } from "@/lib/marketing/execution";
import {
  computeMarketingMetricScore,
  getDefaultMarketingManualInputs,
  marketingRoleTemplates,
  type MarketingManualInputs,
} from "@/lib/marketing/kpi-templates";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

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

type Props = {
  tasks?: MarketingTaskRecord[];
  monthKey?: string;
};

export function MarketingManualKpiResults({ tasks = [], monthKey = "2025-04" }: Props) {
  const [inputs, setInputs] = useState<MarketingManualInputs>(() => getDefaultMarketingManualInputs());

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
    return marketingRoleTemplates.map((role) => {
      const sections = role.sections.map((section) => {
        const metrics = section.metrics.map((metric) => {
          const entry = inputs[`${role.id}:${metric.id}`] ?? { target: metric.target, actual: 0 };
          const score = computeMarketingMetricScore(metric.scoreType, entry.actual, entry.target);
          const ratio = entry.target ? entry.actual / entry.target : 0;
          return {
            ...metric,
            actual: entry.actual,
            target: entry.target,
            ratio,
            score,
          };
        });

        const sectionScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
        const sectionMax = metrics.reduce((sum, metric) => sum + metric.maxScore, 0);

        return {
          ...section,
          metrics,
          sectionScore,
          sectionMax,
        };
      });

      const workbookScore = sections.reduce((sum, section) => sum + section.sectionScore, 0);
      const execution = getMarketingExecutionScore(role.owner, tasks);

      return {
        ...role,
        sections,
        workbookScore,
        executionScore: execution.executionScore,
        totalWithExecution: workbookScore + execution.executionScore,
      };
    });
  }, [inputs, tasks]);

  return (
    <>
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <PenSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">MANUAL KPI INPUTS</p>
            <h2 className="text-2xl font-semibold text-slate-900">Role templates mapped from workbook formulas</h2>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          These role-level KPI inputs are manual and saved in this browser, so you can enter non-ERP values and preview the score logic immediately.
        </p>

        <div className="mt-6 space-y-5">
          {roleResults.map((role) => (
            <div key={role.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{role.role}</p>
                  <p className="mt-1 text-sm text-slate-500">{role.owner}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Workbook score {role.workbookScore}/100
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Task execution {role.executionScore}/40
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {role.sections.map((section) => (
                  <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{section.name}</p>
                        <p className="mt-1 text-sm text-slate-500">Weight {section.weightLabel}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {section.sectionScore}/{section.sectionMax}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {section.metrics.map((metric) => {
                        const key = `${role.id}:${metric.id}`;
                        const entry = inputs[key];
                        return (
                          <div key={metric.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{metric.name}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                                  Max score {metric.maxScore} · {metric.unit}
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {metric.score}/{metric.maxScore}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Target</span>
                                <input
                                  type="number"
                                  value={entry?.target ?? metric.target}
                                  onChange={(event) => {
                                    const next = Number(event.target.value || 0);
                                    setInputs((prev) => ({
                                      ...prev,
                                      [key]: {
                                        target: next,
                                        actual: prev[key]?.actual ?? 0,
                                      },
                                    }));
                                  }}
                                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Actual</span>
                                <input
                                  type="number"
                                  value={entry?.actual ?? 0}
                                  onChange={(event) => {
                                    const next = Number(event.target.value || 0);
                                    setInputs((prev) => ({
                                      ...prev,
                                      [key]: {
                                        target: prev[key]?.target ?? metric.target,
                                        actual: next,
                                      },
                                    }));
                                  }}
                                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
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
            <p className="text-sm font-medium text-brand-700">RESULTS BY OWNER</p>
            <h2 className="text-2xl font-semibold text-slate-900">Workbook KPI roll-up for the 3 mapped roles</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {roleResults.map((role) => (
            <div key={role.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{role.role}</p>
                  <p className="mt-1 text-sm text-slate-500">{role.owner}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {role.workbookScore}/100
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {role.sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between gap-3">
                    <span>{section.name}</span>
                    <span className="font-semibold text-slate-900">
                      {section.sectionScore}/{section.sectionMax}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">PERSON KPIS</p>
            <h2 className="text-2xl font-semibold text-slate-900">Role score summary with manual inputs</h2>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {roleResults.map((role) => (
            <div key={role.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{role.role}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {role.workbookScore}/100
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                <p>Owner {role.owner}</p>
                <p>Sections {role.sections.length}</p>
                <p>Manual metrics {role.sections.reduce((sum, section) => sum + section.metrics.length, 0)}</p>
                <p>Task execution {role.executionScore}/40</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
