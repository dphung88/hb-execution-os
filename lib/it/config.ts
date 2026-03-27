export type ItTaskRecord = {
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

export const IT_OWNERS = [
  "IT Director",
  "System Admin",
  "Developer",
  "Helpdesk",
  "Network Engineer",
];

export const IT_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_IT_TASKS: ItTaskRecord[] = [
  { id: "demo-it-1", monthKey: "2026-03", title: "ERP system upgrade — v2.4 patch", owner: "System Admin", requester: "IT Director", status: "In Progress", dueDate: "2026-03-30", notes: "Staging tested, prod scheduled", progressPercent: 70, priority: "High" },
  { id: "demo-it-2", monthKey: "2026-03", title: "Resolve helpdesk backlog (Q1)", owner: "Helpdesk", requester: "IT Director", status: "In Progress", dueDate: "2026-03-31", notes: "38 tickets remaining", progressPercent: 55, priority: "Medium" },
  { id: "demo-it-3", monthKey: "2026-03", title: "Network firewall rule audit", owner: "Network Engineer", requester: "IT Director", status: "Completed", dueDate: "2026-03-22", notes: "Updated and documented", progressPercent: 100, priority: "High" },
  { id: "demo-it-4", monthKey: "2026-03", title: "Deploy execution OS to production", owner: "Developer", requester: "IT Director", status: "Completed", dueDate: "2026-03-27", notes: "Live on Vercel", progressPercent: 100, priority: "Critical" },
];
