export type SupplyChainTaskRecord = {
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

export const SC_OWNERS = [
  "Supply Chain Director",
  "Procurement Manager",
  "Warehouse Manager",
  "Logistics Coordinator",
  "Inventory Analyst",
];

export const SC_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_SC_TASKS: SupplyChainTaskRecord[] = [
  { id: "demo-sc-1", monthKey: "2026-03", title: "Review reorder points for Q2 demand", owner: "Inventory Analyst", requester: "Supply Chain Director", status: "In Progress", dueDate: "2026-03-31", notes: "12 SKUs flagged for adjustment", progressPercent: 60, priority: "High" },
  { id: "demo-sc-2", monthKey: "2026-03", title: "Negotiate April raw material pricing", owner: "Procurement Manager", requester: "Supply Chain Director", status: "In Progress", dueDate: "2026-03-28", notes: "3 suppliers contacted", progressPercent: 50, priority: "Critical" },
  { id: "demo-sc-3", monthKey: "2026-03", title: "Conduct Q1 warehouse cycle count", owner: "Warehouse Manager", requester: "Supply Chain Director", status: "Completed", dueDate: "2026-03-22", notes: "Variance < 0.5% — within threshold", progressPercent: 100, priority: "High" },
  { id: "demo-sc-4", monthKey: "2026-03", title: "Confirm April delivery schedule with 3PL", owner: "Logistics Coordinator", requester: "Supply Chain Director", status: "Planned", dueDate: "2026-04-02", notes: "", progressPercent: 0, priority: "Medium" },
];
