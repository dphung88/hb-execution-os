import { MarketingTeamHub } from "@/components/marketing/marketing-team-hub";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

export default async function MarketingPerformancePage() {
  const { tasks } = await loadMarketingTasks();

  return <MarketingTeamHub tasks={tasks} />;
}
