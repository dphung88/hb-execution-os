export type FinanceTaskRecord = {
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

export const FINANCE_OWNERS = [
  "CFO",
  "Finance Manager",
  "Accountant",
  "Budget Controller",
  "AR/AP Staff",
];

export const FINANCE_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_FINANCE_TASKS: FinanceTaskRecord[] = [
  { id: "demo-f-1", monthKey: "2026-03", title: "Monthly P&L close", owner: "CFO", requester: "CEO", status: "In Progress", dueDate: "2026-03-31", notes: "Awaiting AR aging data", progressPercent: 60, priority: "High" },
  { id: "demo-f-2", monthKey: "2026-03", title: "Reconcile bank statements", owner: "Accountant", requester: "Finance Manager", status: "Completed", dueDate: "2026-03-25", notes: "Done and signed off", progressPercent: 100, priority: "Medium" },
  { id: "demo-f-3", monthKey: "2026-03", title: "Budget vs Actual report", owner: "Budget Controller", requester: "CFO", status: "Planned", dueDate: "2026-04-05", notes: "", progressPercent: 0, priority: "High" },
  { id: "demo-f-4", monthKey: "2026-03", title: "Collect outstanding invoices", owner: "AR/AP Staff", requester: "Finance Manager", status: "In Progress", dueDate: "2026-03-30", notes: "3 clients pending", progressPercent: 40, priority: "Critical" },
];
