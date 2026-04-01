"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Forecast Config ────────────────────────────────────────────────────────

export async function upsertForecastConfigAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || undefined;

  const row = {
    period:         (formData.get("period")         as string).trim(),
    province:       (formData.get("province")        as string).trim(),
    channel:        (formData.get("channel")         as string).trim(),
    sku:            (formData.get("sku")             as string).trim(),
    universe:       num(formData.get("universe")),
    frequency:      num(formData.get("frequency")),
    upo:            num(formData.get("upo")),
    growth_factor:  num(formData.get("growth_factor"))  ?? 1.0,
    promo_uplift:   num(formData.get("promo_uplift"))   ?? 1.0,
    ramp_m1:        num(formData.get("ramp_m1"))        ?? 0.4,
    ramp_m2:        num(formData.get("ramp_m2"))        ?? 0.7,
    ramp_m3:        num(formData.get("ramp_m3"))        ?? 1.0,
    asp:            num(formData.get("asp")),
    discount_pct:   num(formData.get("discount_pct"))   ?? 0,
    baseline_qty:   num(formData.get("baseline_qty")),
    cogs:           num(formData.get("cogs")),
    target_revenue: num(formData.get("target_revenue")),
  };

  if (id) {
    await admin.from("forecast_config").update(row).eq("id", id);
  } else {
    await admin.from("forecast_config").insert(row);
  }

  revalidatePath("/pipeline");
}

export async function deleteForecastConfigAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const id = formData.get("id") as string;
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("forecast_config").delete().eq("id", id);
  revalidatePath("/pipeline");
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export async function upsertPipelineAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || undefined;

  const row = {
    period:        (formData.get("period")  as string).trim(),
    province:      (formData.get("province") as string).trim(),
    channel:       (formData.get("channel") as string).trim(),
    sku:           (formData.get("sku")     as string).trim(),
    new_listings:  num(formData.get("new_listings")),
    stage:         (formData.get("stage")   as string).trim() || null,
    prob:          num(formData.get("prob")),
    on_shelf_rate: num(formData.get("on_shelf_rate")) ?? 0.9,
    ar_expected:   num(formData.get("ar_expected")),
  };

  if (id) {
    await admin.from("forecast_pipeline").update(row).eq("id", id);
  } else {
    await admin.from("forecast_pipeline").insert(row);
  }

  revalidatePath("/pipeline");
}

export async function deletePipelineAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const id = formData.get("id") as string;
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("forecast_pipeline").delete().eq("id", id);
  revalidatePath("/pipeline");
}

// ─── Actuals ─────────────────────────────────────────────────────────────────

export async function upsertActualsAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const admin = createAdminClient();

  const id = (formData.get("id") as string) || undefined;

  const row = {
    period:            (formData.get("period")   as string).trim(),
    province:          (formData.get("province") as string).trim(),
    channel:           (formData.get("channel")  as string).trim(),
    sku:               (formData.get("sku")       as string).trim(),
    listed_outlets:    num(formData.get("listed_outlets")),
    ordering_outlets:  num(formData.get("ordering_outlets")),
    volume_sold:       num(formData.get("volume_sold")),
    revenue_actual:    num(formData.get("revenue_actual")),
    promo_sell:        num(formData.get("promo_sell")),
    baseline_sold:     num(formData.get("baseline_sold")),
    risk_inventory:    num(formData.get("risk_inventory")),
    risk_sold:         num(formData.get("risk_sold")),
    opening_inventory: num(formData.get("opening_inventory")),
    inflow:            num(formData.get("inflow")),
  };

  if (id) {
    await admin.from("forecast_actuals").update(row).eq("id", id);
  } else {
    await admin.from("forecast_actuals").insert(row);
  }

  revalidatePath("/pipeline");
}

export async function deleteActualsAction(formData: FormData) {
  if (!hasSupabaseAdminEnv()) return;
  const id = formData.get("id") as string;
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("forecast_actuals").delete().eq("id", id);
  revalidatePath("/pipeline");
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = parseFloat(v as string);
  return isNaN(n) ? null : n;
}
