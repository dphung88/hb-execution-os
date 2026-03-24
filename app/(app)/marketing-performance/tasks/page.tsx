import { MarketingTasksWorkspace } from "@/components/marketing/marketing-tasks-workspace";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

type MarketingTasksPageProps = {
  searchParams?: Promise<{
    owner?: string;
    status?: string;
    requester?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function MarketingTasksPage({ searchParams }: MarketingTasksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { tasks, source } = await loadMarketingTasks();

  return <MarketingTasksWorkspace tasks={tasks} source={source} searchParams={resolvedSearchParams} />;
}
