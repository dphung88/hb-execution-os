"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";

type Props = {
  code: string;
  name: string | null;
};

export function SkuNameField({ code, name }: Props) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = name || code;

  function startEdit() {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        name="name"
        defaultValue={name ?? ""}
        placeholder="SKU display name"
        onBlur={() => setEditing(false)}
        className="h-9 w-full rounded-xl border border-sky-400 bg-white px-3 text-sm text-slate-900 outline-none ring-2 ring-sky-100 transition"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex h-9 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
    >
      <span className="flex-1 truncate">{displayName}</span>
      <Pencil className="h-3 w-3 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
      {/* Hidden input so form always submits a name value */}
      <input type="hidden" name="name" value={name ?? ""} />
    </button>
  );
}
