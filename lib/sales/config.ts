export type SalesTaskRecord = {
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

export const SALES_OWNERS = [
  "Sales Director",
  "Regional Sales Manager",
  "Key Account Manager",
  "Area Sales Manager",
  "Sales Admin",
];

export const SALES_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_SALES_TASKS: SalesTaskRecord[] = [
  {
    id: "demo-sales-1", monthKey: "2026-04",
    title: "Prepare April channel sell-in plan",
    owner: "Sales Director", requester: "CEO",
    status: "In Progress", dueDate: "2026-04-05",
    notes: "OTC and ETC targets drafted, pending approval",
    progressPercent: 60, priority: "Critical",
  },
  {
    id: "demo-sales-2", monthKey: "2026-04",
    title: "Visit top 10 KA pharmacies in HCM",
    owner: "Key Account Manager", requester: "Sales Director",
    status: "Planned", dueDate: "2026-04-10",
    notes: "",
    progressPercent: 0, priority: "High",
  },
  {
    id: "demo-sales-3", monthKey: "2026-04",
    title: "Collect Q1 competitor pricing from field ASMs",
    owner: "Regional Sales Manager", requester: "Sales Director",
    status: "Completed", dueDate: "2026-04-03",
    notes: "18 ASMs submitted. Report compiled.",
    progressPercent: 100, priority: "Medium",
  },
  {
    id: "demo-sales-4", monthKey: "2026-04",
    title: "Submit April sales target agreements to finance",
    owner: "Sales Admin", requester: "Sales Director",
    status: "Under Review", dueDate: "2026-04-08",
    notes: "Awaiting CFO sign-off",
    progressPercent: 85, priority: "High",
  },
];
