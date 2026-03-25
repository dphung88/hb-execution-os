import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

import {
  computeMarketingMetricScore,
  marketingRoleTemplates,
  type MarketingManualInputs,
} from "@/lib/marketing/kpi-templates";
import { getMarketingExecutionScore } from "@/lib/marketing/execution";

function clampPercent(value: number) {
  return Math.max(0, Math.min(95, value));
}

export function getMarketingPayoutPercent(workbookScore: number) {
  if (workbookScore <= 0) return 0;
  return clampPercent(Math.ceil(workbookScore / 5) * 5);
}

export function buildMarketingRoleResults(
  inputs: MarketingManualInputs,
  tasks: MarketingTaskRecord[] = []
) {
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
    const payoutPercent = getMarketingPayoutPercent(workbookScore);
    const payoutAmount = Math.round((role.payoutBase * payoutPercent) / 100);

    return {
      ...role,
      sections,
      workbookScore,
      executionScore: execution.executionScore,
      totalWithExecution: workbookScore + execution.executionScore,
      payoutBase: role.payoutBase,
      payoutPercent,
      payoutAmount,
    };
  });
}
