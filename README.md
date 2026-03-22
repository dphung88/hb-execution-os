# HB Execution OS - Phase 1

Phase 1 is a TypeScript `Next.js` app that establishes the first working slice of HB Execution OS:

- Supabase-backed authentication
- Protected application layout with sidebar and topbar
- Basic dashboard
- Task list
- Task create flow
- Task detail page
- SQL migration for auth-linked profiles and tasks

## Stack

- `Next.js 15` with App Router
- `TypeScript`
- `Tailwind CSS`
- `Supabase Auth + Postgres`

## Project structure

```text
app/
  (auth)/
    login/
  (app)/
    dashboard/
    tasks/
  api/
components/
  layout/
  tasks/
  ui/
lib/
  supabase/
  tasks/
supabase/
  migrations/
types/
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values.

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ERP_ASM_KPI_BASE_URL`
- `ERP_ASM_KPI_API_KEY`

## Supabase setup

1. Create a new Supabase project.
2. In Supabase Auth, enable email/password sign-in.
3. Run the SQL migration in the Supabase SQL editor:
   - [`supabase/migrations/202603220001_phase1_tasks.sql`](/Users/edisonyang/Documents/New project 2/supabase/migrations/202603220001_phase1_tasks.sql)
   - [`supabase/migrations/202603230001_sales_erp_sync.sql`](/Users/edisonyang/Documents/New project 2/supabase/migrations/202603230001_sales_erp_sync.sql)
4. Create your first user in Supabase Auth.
5. Sign in from `/login`.

## Sales ERP sync preparation

The Sales KPI module is designed to read operational data from Supabase after a server-side ERP sync.

- Official revenue metric for KPI scoring: `revenue_without_vat`
- ERP sync design reference: [`docs/sales-erp-sync.md`](/Users/edisonyang/Documents/New project 2/docs/sales-erp-sync.md)
- Response normalization helper: [`lib/sales/erp-contract.ts`](/Users/edisonyang/Documents/New project 2/lib/sales/erp-contract.ts)

Recommended data flow:

1. ERP API responds with ASM KPI data for a requested date range.
2. Next.js server code normalizes the payload.
3. Supabase stores:
   - one snapshot row in `kpi_data`
   - one sync log row in `sales_kpi_sync_runs`
   - all item lines in `kpi_item_breakdowns`
4. Dashboard pages load from Supabase, not from the ERP API directly.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Notes

- This phase intentionally does not include OCR, AI workflows, notifications, or WhatsApp.
- Task creation currently assigns the logged-in user as both creator and owner.
- Row Level Security is enabled for the core tables.
