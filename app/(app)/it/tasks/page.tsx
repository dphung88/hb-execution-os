import { ItTasksWorkspace } from "@/components/it/it-tasks-workspace";
import { loadItTasks } from "@/lib/it/tasks";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string; owner?: string; status?: string; saved?: string; error?: string }> };

export default async function ItTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const { tasks, source } = await loadItTasks(selectedPeriod);

  return (
    <ItTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
