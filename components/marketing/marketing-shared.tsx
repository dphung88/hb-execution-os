export function marketingToneClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("completed")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("progress")) return "bg-sky-50 text-sky-700";
  if (normalized.includes("planned") || normalized.includes("pending") || normalized.includes("review")) {
    return "bg-amber-50 text-amber-700";
  }
  if (normalized.includes("failed")) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}
