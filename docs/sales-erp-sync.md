# Sales ERP Sync Contract

This document defines the server-side sync flow for the Sales KPI module on `vp.edisonyang.store`.

## Confirmed source rule

- `revenue_without_vat` is the official revenue metric for Sales KPI scoring.

## ERP endpoint

- Method: `GET`
- Base URL env: `ERP_ASM_KPI_BASE_URL`
- Path: `/api/asm-kpi/get_data`
- Header: `X-API-KEY: <ERP_ASM_KPI_API_KEY>`

## Required query params

- `employee_code`
- `from_date`
- `to_date`

## Response shape

```json
{
  "success": true,
  "data": {
    "employee_code": "NV0070",
    "from_date": "2026-03-01",
    "to_date": "2026-03-20",
    "revenue_without_vat": 61888921,
    "revenue_with_vat": 66840038,
    "new_customer_count": 0,
    "items": [
      {
        "item_code": "HB006",
        "item_name": "GLUTA WHITE (C/30V) (CHLC)",
        "quantity": 27
      }
    ]
  }
}
```

## Supabase storage plan

### `kpi_data`

Primary monthly snapshot used by the Sales KPI dashboard and ASM detail pages.

Mapped fields:

- `asm_id <- employee_code`
- `month <- YYYY-MM derived from from_date`
- `from_date <- from_date`
- `to_date <- to_date`
- `dt_thuc_dat <- revenue_without_vat`
- `revenue_with_vat <- revenue_with_vat`
- `kh_moi <- new_customer_count`
- `hb006 <- sum(items where item_code = HB006)`
- `hb034 <- sum(items where item_code = HB034)`
- `hb031 <- sum(items where item_code = HB031)`
- `hb035 <- sum(items where item_code = HB035)`
- `source_synced_at <- sync timestamp`
- `raw_payload <- full ERP payload`

### `kpi_item_breakdowns`

Stores the full item list from ERP for auditability and future rule changes.

### `sales_kpi_sync_runs`

Stores each sync request and result for observability, retries, and troubleshooting.

## Recommended runtime flow

1. A server-side job or internal route requests ERP KPI data for one ASM and one period.
2. The response is normalized by `lib/sales/erp-contract.ts`.
3. The app upserts one row into `kpi_data`.
4. The app replaces item rows in `kpi_item_breakdowns` for the same ASM/month/date range.
5. The app records success or failure in `sales_kpi_sync_runs`.
6. UI pages read from Supabase, not directly from ERP.

## Why Supabase stays the source of truth

- The dashboard remains fast and stable even when ERP is slow.
- Historical views can be loaded without re-querying ERP.
- KPI rules can be recalculated from stored snapshots and item breakdowns.
- Audit trails become possible for payout disputes and manager review.

## Google Drive role

Google Drive is optional and should stay secondary:

- Good for raw ERP export backup
- Good for monthly archive packages
- Good for reconciliation files

Not recommended as the live application data source.
