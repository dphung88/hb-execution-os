import { MarketingTasksWorkspace } from "@/components/marketing/marketing-tasks-workspace";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

type MarketingTasksPageProps = {
  searchParams?: Promise<{
    period?: string;
    owner?: string;
    status?: string;
    requester?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function MarketingTasksPage({ searchParams }: MarketingTasksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = resolvedSearchParams?.period ?? getCurrentPeriod(periods);
  const { tasks, source } = await loadMarketingTasks(selectedPeriod);

  return (
    <MarketingTasksWorkspace
      tasks={tasks}
      source={source}
      searchParams={resolvedSearchParams}
      periods={periods}
      selectedPeriod={selectedPeriod}
    />
  );
}
