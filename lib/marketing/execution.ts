import { marketingTaskTracker } from "@/lib/demo-data";

type MarketingTask = (typeof marketingTaskTracker)[number];

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

export function getMarketingTasksByOwner(owner: string) {
  return marketingTaskTracker.filter((task) => task.owner === owner);
}

export function getMarketingExecutionScore(owner: string) {
  const tasks = getMarketingTasksByOwner(owner);

  if (!tasks.length) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      statusAverage: 0,
      executionScore: 0,
    };
  }

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const overdueTasks = tasks.filter(isOverdue).length;
  const completionRate = completedTasks / tasks.length;
  const statusAverage = tasks.reduce((sum, task) => sum + statusWeight(task.status), 0) / tasks.length;
  const overduePenalty = overdueTasks * 0.08;
  const executionRatio = Math.max(0, Math.min(1, statusAverage - overduePenalty));
  const executionScore = Math.round(executionRatio * 40);

  return {
    totalTasks: tasks.length,
    completedTasks,
    overdueTasks,
    completionRate,
    statusAverage,
    executionScore,
  };
}

export function getMarketingTeamExecutionSummary() {
  const owners = Array.from(new Set(marketingTaskTracker.map((task) => task.owner)));
  const ownerRows = owners.map((owner) => ({
    owner,
    ...getMarketingExecutionScore(owner),
  }));

  const averageExecutionScore = ownerRows.length
    ? Math.round(ownerRows.reduce((sum, row) => sum + row.executionScore, 0) / ownerRows.length)
    : 0;

  return {
    owners: ownerRows,
    averageExecutionScore,
    completedTasks: marketingTaskTracker.filter((task) => task.status === "Completed").length,
    totalTasks: marketingTaskTracker.length,
  };
}
