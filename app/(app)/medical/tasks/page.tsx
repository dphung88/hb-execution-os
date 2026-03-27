import { MedicalTasksWorkspace } from "@/components/medical/medical-tasks-workspace";
import { loadMedicalTasks } from "@/lib/medical/tasks";
import { getPeriods } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string; owner?: string; status?: string; saved?: string; error?: string }> };

export default async function MedicalTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const { tasks, source } = await loadMedicalTasks(selectedPeriod);

  return (
    <MedicalTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
