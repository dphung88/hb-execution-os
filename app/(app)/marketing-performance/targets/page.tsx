import { MarketingTargetsWorkspace } from "@/components/marketing/marketing-targets-workspace";
import { getPeriods } from "@/lib/config/periods";
import { loadMarketingManualInputs } from "@/lib/marketing/results-store";
import { loadMarketingTasks } from "@/lib/marketing/tasks";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function MarketingTargetsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const { tasks } = await loadMarketingTasks(selectedPeriod);
  const { inputs, source } = await loadMarketingManualInputs(selectedPeriod);

  return (
    <MarketingTargetsWorkspace
      tasks={tasks}
      manualInputs={inputs}
      manualSource={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
    />
  );
}
