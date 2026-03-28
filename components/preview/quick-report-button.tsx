"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickReportButton() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    setState("sending");
    try {
      const res = await fetch("/api/send-report", { method: "POST" });
      const json = await res.json();
      setState(json.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 3000);
  }

  const label =
    state === "sending" ? "Sending…" :
    state === "sent"    ? "Sent ✓" :
    state === "error"   ? "Failed ✗" :
    "Quick Report";

  return (
    <Button
      onClick={handleSend}
      disabled={state === "sending"}
      variant="secondary"
      className="gap-2"
    >
      <Send className="h-4 w-4" />
      {label}
    </Button>
  );
}
