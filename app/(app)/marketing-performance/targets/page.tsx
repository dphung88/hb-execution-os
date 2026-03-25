import { MarketingTargetsWorkspace } from "@/components/marketing/marketing-targets-workspace";
import { loadMarketingManualInputs } from "@/lib/marketing/results-store";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

export default async function MarketingTargetsPage() {
  const { tasks } = await loadMarketingTasks();
  const { inputs, source } = await loadMarketingManualInputs();

  return <MarketingTargetsWorkspace tasks={tasks} manualInputs={inputs} manualSource={source} />;
}
