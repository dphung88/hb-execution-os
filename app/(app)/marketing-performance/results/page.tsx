import { MarketingResultsWorkspace } from "@/components/marketing/marketing-results-workspace";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

export default async function MarketingResultsPage() {
  const { tasks } = await loadMarketingTasks();

  return <MarketingResultsWorkspace tasks={tasks} />;
}
