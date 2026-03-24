import { MarketingKpisWorkspace } from "@/components/marketing/marketing-kpis-workspace";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

export default async function MarketingKpisPage() {
  const { tasks } = await loadMarketingTasks();

  return <MarketingKpisWorkspace tasks={tasks} />;
}
