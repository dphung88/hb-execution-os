import { ScTasksWorkspace } from "@/components/supply-chain/sc-tasks-workspace";
import { loadScTasks } from "@/lib/supply-chain/tasks";
import { getPeriods } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string; owner?: string; status?: string; saved?: string; error?: string }> };

export default async function ScTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const { tasks, source } = await loadScTasks(selectedPeriod);

  return (
    <ScTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
