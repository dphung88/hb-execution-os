export type HrTaskRecord = {
  id: string;
  monthKey: string;
  title: string;
  owner: string;
  requester: string;
  status: string;
  dueDate: string;
  notes: string;
  progressPercent: number;
  priority: string;
  fileLink?: string;
};

export const HR_OWNERS = [
  "HR Director",
  "HR Manager",
  "Recruiter",
  "Payroll Staff",
  "Training Coordinator",
];

export const HR_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_HR_TASKS: HrTaskRecord[] = [
  { id: "demo-hr-1", monthKey: "2026-03", title: "Quarterly headcount review", owner: "HR Director", requester: "CEO", status: "In Progress", dueDate: "2026-03-31", notes: "Awaiting dept. submissions", progressPercent: 50, priority: "High" },
  { id: "demo-hr-2", monthKey: "2026-03", title: "Process March payroll", owner: "Payroll Staff", requester: "HR Manager", status: "Completed", dueDate: "2026-03-25", notes: "Paid on time", progressPercent: 100, priority: "Critical" },
  { id: "demo-hr-3", monthKey: "2026-03", title: "Post 3 open positions", owner: "Recruiter", requester: "HR Director", status: "In Progress", dueDate: "2026-03-28", notes: "2 of 3 posted", progressPercent: 65, priority: "High" },
  { id: "demo-hr-4", monthKey: "2026-03", title: "Run Q1 compliance training", owner: "Training Coordinator", requester: "HR Manager", status: "Planned", dueDate: "2026-04-05", notes: "", progressPercent: 0, priority: "Medium" },
];
