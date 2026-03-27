export type MedicalTaskRecord = {
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

export const MEDICAL_OWNERS = [
  "Medical Director",
  "Regulatory Affairs",
  "Quality Assurance",
  "Clinical Manager",
  "Pharmacovigilance",
];

export const MEDICAL_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_MEDICAL_TASKS: MedicalTaskRecord[] = [
  { id: "demo-med-1", monthKey: "2026-03", title: "Submit product registration renewal", owner: "Regulatory Affairs", requester: "Medical Director", status: "In Progress", dueDate: "2026-03-31", notes: "Dossier 80% ready", progressPercent: 80, priority: "Critical" },
  { id: "demo-med-2", monthKey: "2026-03", title: "Q1 quality audit — manufacturing site", owner: "Quality Assurance", requester: "Medical Director", status: "Completed", dueDate: "2026-03-20", notes: "No critical findings", progressPercent: 100, priority: "High" },
  { id: "demo-med-3", monthKey: "2026-03", title: "Adverse event case review", owner: "Pharmacovigilance", requester: "Medical Director", status: "In Progress", dueDate: "2026-03-28", notes: "2 cases pending MedWatch", progressPercent: 50, priority: "High" },
  { id: "demo-med-4", monthKey: "2026-03", title: "Clinical trial site monitoring visit", owner: "Clinical Manager", requester: "Medical Director", status: "Planned", dueDate: "2026-04-10", notes: "", progressPercent: 0, priority: "Medium" },
];
