import { MarketingResultsWorkspace } from "@/components/marketing/marketing-results-workspace";
import { loadMarketingManualInputs } from "@/lib/marketing/results-store";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

export default async function MarketingResultsPage() {
  const { tasks } = await loadMarketingTasks();
  const { inputs, source } = await loadMarketingManualInputs();

  return <MarketingResultsWorkspace tasks={tasks} manualInputs={inputs} manualSource={source} />;
}
