import { marketingTaskTracker } from "@/lib/demo-data";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";

type MarketingTask = Pick<MarketingTaskRecord, "owner" | "status" | "dueDate">;

const OWNER_ALIASES: Record<string, string[]> = {
  "Senior Manager": ["Senior Manager"],
  "Junior Executive": ["Junior Executive"],
  "Digital Marketer": ["Digital Marketer", "Digital Marketer #1", "Content Creator #1"],
  "E-Com Operations": ["E-Com Operations", "Content Creator #2"],
  "Graphic Designer": ["Graphic Designer", "Designer"],
  "Media Editor": ["Media Editor", "Editor"],
};

const EXECUTION_REFERENCE_DATE = new Date("2025-03-20T00:00:00.000Z");

function statusWeight(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "completed") return 1;
  if (normalized === "in progress") return 0.75;
  if (normalized === "under review") return 0.65;
  if (normalized === "planned") return 0.4;
  if (normalized === "pending") return 0.3;
  if (normalized === "not started") return 0.15;
  if (normalized === "failed") return 0;
  return 0.25;
}

function isOverdue(task: MarketingTask) {
  return new Date(task.dueDate) < EXECUTION_REFERENCE_DATE && task.status !== "Completed";
}

function getDefaultTasks(): MarketingTask[] {
  return marketingTaskTracker.map((task) => ({
    owner: task.owner,
    status: task.status,
    dueDate: task.dueDate,
  }));
}

function normalizeOwner(value: string) {
  return value.trim().toLowerCase();
}

export function getMarketingTasksByOwner(owner: string, tasks: MarketingTask[] = getDefaultTasks()) {
  const aliases = OWNER_ALIASES[owner] ?? [owner];
  const normalizedAliases = aliases.map(normalizeOwner);
  return tasks.filter((task) => normalizedAliases.includes(normalizeOwner(task.owner)));
}

export function getMarketingExecutionScore(owner: string, tasks: MarketingTask[] = getDefaultTasks()) {
  const scopedTasks = getMarketingTasksByOwner(owner, tasks);

  if (!scopedTasks.length) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      statusAverage: 0,
      executionScore: 0,
    };
  }

  const completedTasks = scopedTasks.filter((task) => task.status === "Completed").length;
  const overdueTasks = scopedTasks.filter(isOverdue).length;
  const completionRate = completedTasks / scopedTasks.length;
  const statusAverage = scopedTasks.reduce((sum, task) => sum + statusWeight(task.status), 0) / scopedTasks.length;
  const overduePenalty = overdueTasks * 0.08;
  const executionRatio = Math.max(0, Math.min(1, statusAverage - overduePenalty));
  const executionScore = Math.round(executionRatio * 40);

  return {
    totalTasks: scopedTasks.length,
    completedTasks,
    overdueTasks,
    completionRate,
    statusAverage,
    executionScore,
  };
}

export function getMarketingTeamExecutionSummary(tasks: MarketingTask[] = getDefaultTasks()) {
  const owners = Array.from(new Set(tasks.map((task) => task.owner)));
  const ownerRows = owners.map((owner) => ({
    owner,
    ...getMarketingExecutionScore(owner, tasks),
  }));

  const averageExecutionScore = ownerRows.length
    ? Math.round(ownerRows.reduce((sum, row) => sum + row.executionScore, 0) / ownerRows.length)
    : 0;

  return {
    owners: ownerRows,
    averageExecutionScore,
    completedTasks: tasks.filter((task) => task.status === "Completed").length,
    totalTasks: tasks.length,
  };
}
