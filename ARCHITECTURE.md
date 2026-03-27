# HB Execution OS — Developer Architecture Guide

> **Mục đích:** Tài liệu này mô tả toàn bộ kiến trúc, cấu trúc code, kết nối dữ liệu, và cách vận hành của hệ thống. Bất kỳ developer nào đọc tài liệu này đều có thể hiểu và tiếp tục xây dựng hệ thống.

---

## 1. Tổng quan hệ thống

**HB Execution OS** là một hệ thống quản lý thực thi nội bộ cho công ty Healthy Beauty Pharma, bao gồm:

- **Sales Performance:** Dashboard KPI cho từng ASM (Area Sales Manager), đồng bộ dữ liệu từ ERP, forecast doanh thu và clearstock
- **Marketing Performance:** Theo dõi task execution, KPI marketing, và tính điểm thực thi theo vai trò
- **Task Management:** Quản lý task, blocker, escalation nội bộ
- **Settings:** Quản lý kỳ (period), danh mục SKU, ngày lô hàng

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.8 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS 3.4 |
| Deployment | Vercel |
| Cron Jobs | Vercel Cron |

---

## 2. Cấu trúc thư mục

```
/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (metadata, fonts)
│   ├── page.tsx                 # Redirect → /dashboard
│   ├── (auth)/                  # Authentication routes (no sidebar)
│   │   ├── layout.tsx
│   │   └── login/
│   │       ├── page.tsx         # Login form UI
│   │       └── actions.ts       # Server Action: signIn
│   ├── (app)/                   # Main app routes (with sidebar)
│   │   ├── layout.tsx           # App layout: sidebar + topbar
│   │   ├── dashboard/
│   │   │   └── page.tsx         # CEO/leader dashboard
│   │   ├── tasks/
│   │   │   ├── page.tsx         # Task list
│   │   │   ├── new/page.tsx     # Create task form
│   │   │   └── [id]/page.tsx    # Task detail/edit
│   │   ├── sales-performance/
│   │   │   ├── page.tsx         # Main sales scorecard hub
│   │   │   ├── [id]/page.tsx    # Individual ASM detail
│   │   │   ├── forecast/page.tsx        # Revenue forecast
│   │   │   ├── sku-forecast/page.tsx    # SKU clearstock forecast (all SKUs)
│   │   │   ├── volume/page.tsx          # Sales volume by SKU
│   │   │   ├── targets/
│   │   │   │   ├── page.tsx     # Sales targets form (bulk + per-ASM)
│   │   │   │   └── actions.ts   # Server Actions: saveSalesTargetRow, saveDefaults
│   │   ├── marketing-performance/
│   │   │   ├── page.tsx         # Marketing team hub
│   │   │   ├── tasks/           # Marketing tasks CRUD
│   │   │   ├── results/         # KPI results input
│   │   │   ├── kpis/            # KPI definitions
│   │   │   └── targets/         # Role-based targets
│   │   ├── settings/
│   │   │   ├── page.tsx         # Settings hub
│   │   │   ├── periods/         # Period management (YYYY-MM)
│   │   │   └── skus/            # SKU lot date registry
│   │   │       ├── page.tsx
│   │   │       └── actions.ts   # upsertSkuLotDate, deleteSkuLotDate
│   │   ├── meetings/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── briefs/page.tsx
│   └── api/
│       ├── auth/callback/route.ts       # OAuth callback
│       └── cron/sync-sales/route.ts     # Vercel Cron: daily ERP sync
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── topbar.tsx           # Top bar with user info
│   │   ├── mobile-nav.tsx       # Mobile navigation
│   │   └── nav-config.ts        # Navigation link definitions
│   ├── sales/
│   │   ├── sales-performance-hub.tsx    # Main scorecard grid
│   │   ├── sales-performance-detail.tsx # Single ASM view
│   │   ├── sales-forecast-workspace.tsx # Revenue forecast UI
│   │   ├── sku-forecast-workspace.tsx   # SKU clearstock forecast UI
│   │   ├── sales-volume-workspace.tsx   # Volume breakdown UI
│   │   ├── mobile-sales-scorecard-selector.tsx
│   │   └── mobile-sales-targets-selector.tsx
│   ├── marketing/
│   │   ├── marketing-team-hub.tsx
│   │   └── marketing-results-workspace.tsx
│   ├── settings/
│   │   └── sku-name-field.tsx   # Click-to-edit name field (Client Component)
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       └── period-selector.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client (SSR)
│   │   ├── admin.ts             # Admin client (service role, bypass RLS)
│   │   ├── write.ts             # Write client (mutations)
│   │   ├── middleware.ts        # Session refresh middleware
│   │   └── env.ts               # Env var validation
│   ├── sales/
│   │   ├── queries.ts           # All sales DB queries + type definitions
│   │   ├── sync.ts              # ERP sync logic
│   │   ├── erp-contract.ts      # ERP API types + normalization
│   │   ├── scorecards.ts        # Scorecard calculation
│   │   └── forecast.ts          # Revenue + SKU forecast math
│   ├── marketing/
│   │   ├── execution.ts         # Task execution scoring
│   │   ├── tasks.ts             # Task loading
│   │   ├── scoring.ts           # KPI scoring
│   │   └── results-store.ts     # Results aggregation
│   ├── config/
│   │   └── periods.ts           # Period config (Supabase → cookie → file fallback)
│   ├── demo-data.ts             # Fallback demo data (preview mode)
│   └── utils.ts                 # Helpers: cn(), date formatting
│
├── supabase/
│   └── migrations/              # SQL migration files (run in order)
│
├── middleware.ts                # Next.js middleware (auth guard)
├── .env.local                   # Environment variables (never commit)
└── .env.example                 # Template for env variables
```

---

## 3. Cơ sở dữ liệu (Supabase / PostgreSQL)

### 3.1 Danh sách bảng

#### Authentication & Users
| Bảng | Mô tả |
|---|---|
| `auth.users` | Quản lý bởi Supabase Auth |
| `profiles` | Thông tin user: role, department, full_name |
| `departments` | 7 phòng ban: Sales, Marketing, IT, HR, Finance, Supply Chain, Medical |

#### Sales Module
| Bảng | Mô tả |
|---|---|
| `sales_kpi_sync_runs` | Log mỗi lần sync ERP: thời gian, trạng thái, số ASM sync được |
| `kpi_item_breakdowns` | Dữ liệu bán hàng từng SKU theo ASM theo tháng (từ ERP) |
| `sales_monthly_targets` | Target tháng: doanh thu, Key SKU code/quantity, Clearstock code/quantity |
| `sales_manager_reviews` | Điểm kỷ luật và chấm công của ASM theo tháng |
| `sku_lot_dates` | Registry SKU: code, tên, lot date, tồn kho, weekly sell-out |

#### Marketing Module
| Bảng | Mô tả |
|---|---|
| `marketing_members` | Danh sách thành viên marketing |
| `marketing_tasks` | Nhiệm vụ marketing theo tháng/tuần |
| `marketing_kpi_definitions` | Định nghĩa KPI (team/person scope) |
| `marketing_kpi_results` | Kết quả KPI thực tế vs target |
| `marketing_manual_inputs` | Input thủ công cho tính toán KPI |
| `marketing_role_results` | Điểm và payout theo vai trò |

#### Task & Execution
| Bảng | Mô tả |
|---|---|
| `tasks` | Task với status, priority, health, blocker |
| `task_updates` | Lịch sử cập nhật task |
| `blockers` | Blocker liên phòng ban với cờ escalation |
| `escalations` | Lịch sử escalation: dept_lead → VP → CEO |
| `department_goals` | Mục tiêu quý/năm theo phòng ban |
| `initiatives` | Sáng kiến con của goals |

#### Configuration
| Bảng | Mô tả |
|---|---|
| `app_periods` | Định nghĩa kỳ: key (YYYY-MM), label, start_date, end_date |
| `notifications` | Thông báo in-app + WhatsApp |
| `executive_briefs` | Báo cáo CEO/Board |

### 3.2 Quan hệ quan trọng

```
profiles.id ──────────────── auth.users.id
tasks.owner_id ──────────── profiles.id
kpi_item_breakdowns.asm_id ── (ASM employee code từ ERP)
sales_monthly_targets.asm_id ─ (ASM employee code)
sku_lot_dates.code ─────────── kpi_item_breakdowns.item_code
```

### 3.3 Row Level Security (RLS)

- Tất cả bảng đều có **RLS enabled**
- Policy mặc định: authenticated user có thể **SELECT** toàn bộ
- Bảng `profiles`, `tasks`: có thêm INSERT/UPDATE policy
- Bảng `sku_lot_dates`: policy `Allow all` (admin-managed)
- Server-side dùng **service role key** (`createAdminClient()`) để bypass RLS

---

## 4. Biến môi trường (.env.local)

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key - public, safe for browser]
SUPABASE_SERVICE_ROLE_KEY=[service role key - SECRET, server only]

# ERP Integration
ERP_ASM_KPI_BASE_URL=http://27.71.27.239:8000
ERP_ASM_KPI_API_KEY=[API key for ERP server]

# Cron
CRON_SECRET=[random string for Vercel Cron auth header]
```

> ⚠️ **KHÔNG commit `.env.local` lên git.** Chỉ commit `.env.example` (template không có giá trị thật).

---

## 5. Tích hợp bên ngoài

### 5.1 ERP API

- **Base URL:** `http://27.71.27.239:8000`
- **Auth:** Header `X-API-KEY: [key]`
- **Endpoint duy nhất:** `GET /api/asm-kpi/get_data`

**Request params:**
```
employee_code=ASM001
from_date=2026-03-01
to_date=2026-03-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_code": "ASM001",
    "revenue_without_vat": 1250000000,
    "revenue_with_vat": 1375000000,
    "new_customer_count": 15,
    "items": [
      { "item_code": "HB031", "item_name": "HB CoQ10...", "quantity": 120 }
    ]
  }
}
```

> **Lưu ý:** ERP hiện tại chỉ có `item_code`, `item_name`, `quantity`. **Không có lot date.** Lot date quản lý riêng trong bảng `sku_lot_dates`.

### 5.2 Vercel Cron

- **Schedule:** `0 6 * * *` (06:00 UTC = 13:00 Vietnam)
- **Endpoint:** `GET /api/cron/sync-sales`
- **Auth:** Header `Authorization: Bearer [CRON_SECRET]`
- **Tác dụng:** Sync dữ liệu ERP cho tháng hiện tại + tháng trước vào DB

---

## 6. Luồng dữ liệu chính

### 6.1 Authentication

```
User → /login → signIn(email, password)
     → supabase.auth.signInWithPassword()
     → Trigger: handle_new_user() → tạo profile record
     → Redirect → /dashboard
     → middleware.ts → updateSession() xác thực cookie mỗi request
```

### 6.2 Sales Dashboard

```
GET /sales-performance?period=2026-03

getSalesScorecardsData(period)
 ├── getKpiDataForPeriod()       → SELECT từ kpi_item_breakdowns (ERP data)
 ├── getSalesTargets()           → SELECT từ sales_monthly_targets
 ├── loadSalesReviews()          → SELECT từ sales_manager_reviews
 └── loadSkuBreakdowns()         → SELECT từ kpi_item_breakdowns (per-SKU)

→ Tính toán delta (actual vs target), variance%, status
→ Server Component render SalesPerformanceHub
```

### 6.3 ERP Daily Sync (Cron)

```
Vercel Cron (06:00 UTC)
 → GET /api/cron/sync-sales
 → Verify Bearer token
 → Loop qua demoSalesAsms (hardcoded ASM list)
     → fetchAsmKpi(employeeCode, period, dateRange)
         → GET ERP /api/asm-kpi/get_data
         → normalizeErpAsmKpiResponse() → extract revenue, items
     → upsert vào kpi_item_breakdowns
     → ghi log vào sales_kpi_sync_runs
 → revalidatePath('/sales-performance')
 → Return { ok: true, results: { period: { syncedCount, failedCount } } }
```

### 6.4 SKU Forecast

```
GET /sales-performance/sku-forecast?period=2026-03

Page Server Component:
 ├── Query kpi_item_breakdowns → aggregate quantity by item_code
 └── Query sku_lot_dates → get lot_date, stock_on_hand, weekly_sell_out

Cho mỗi SKU:
 averageDailySell = elapsedDays > 0
   ? totalActual / elapsedDays
   : weekly_sell_out / 7

 daysUntilExpiry = lotDate - today
 requiredDailySell = stock_on_hand / daysUntilExpiry
 dailySellGap = averageDailySell - requiredDailySell

 risk:
   dailySellGap >= 0       → "Healthy"
   dailySellGap >= -30%    → "Watch"
   otherwise               → "At risk"

→ Sort: At risk → Watch → Healthy → No date
→ Render SkuForecastWorkspace (Client Component)
```

### 6.5 Period Config (Multi-level fallback)

```
getPeriods()
 1. Supabase: SELECT FROM app_periods ORDER BY key DESC
 2. Cookie: COOKIE_NAME="periods-config" (JSON, 1 năm)
 3. Local file: lib/config/periods-data.json
 4. Hardcoded DEFAULT_PERIODS constant

savePeriods(periods):
 → Upsert vào app_periods
 → Set cookie
 → Write local file (dev only)
```

---

## 7. Patterns quan trọng

### 7.1 Server vs Client Components

- **Mặc định:** Server Component (fetch dữ liệu trực tiếp trong component)
- **Client Component** (`"use client"`) chỉ khi cần: state, event handlers, browser APIs
- Ví dụ Client Components: `SkuNameField`, `SkuForecastWorkspace`, navigation components

### 7.2 Admin Client vs Regular Client

```typescript
// Server-side (bypass RLS) — dùng cho admin reads/writes
import { createAdminClient } from "@/lib/supabase/admin";
const admin = createAdminClient(); // dùng SUPABASE_SERVICE_ROLE_KEY

// Server-side (respect RLS) — dùng cho user-specific data
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // dùng session cookie

// Client-side
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // dùng anon key
```

### 7.3 Server Actions (Form mutations)

```typescript
// page.tsx — truyền action vào form
<form action={upsertSkuLotDateAction}>

// actions.ts — Server Action
"use server";
export async function upsertSkuLotDateAction(formData: FormData) {
  const admin = createAdminClient();
  await admin.from("sku_lot_dates").upsert({ ... });
  revalidatePath("/settings/skus");
}
```

### 7.4 Period-keyed data

Tất cả dữ liệu time-series dùng format `YYYY-MM`:
```typescript
// URL param
/sales-performance?period=2026-03

// DB query
.eq("month", selectedPeriod)  // "2026-03"
.eq("period_key", selectedPeriod)
```

### 7.5 Preview / Demo Mode

```typescript
// lib/supabase/env.ts
export function hasSupabaseAdminEnv() {
  return !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

// Mọi query đều check trước:
if (!hasSupabaseAdminEnv()) return demoData;
```

---

## 8. SQL Migrations

Chạy **theo thứ tự** trong Supabase Dashboard > SQL Editor:

| File | Mô tả |
|---|---|
| `202603220001_phase1_tasks.sql` | Profiles, departments, tasks, indexes, RLS |
| `202603220002_execution_os_7_departments.sql` | Goals, initiatives, blockers, KPIs, notifications |
| `202603230001_sales_erp_sync.sql` | sales_kpi_sync_runs, kpi_item_breakdowns |
| `202603230002_sales_targets_and_reviews.sql` | sales_monthly_targets, sales_manager_reviews |
| `202603240002_marketing_team_module.sql` | Marketing: members, tasks, KPI |
| `202603250001_marketing_kpi_inputs.sql` | marketing_manual_inputs, marketing_role_results |
| `202603260001_app_periods.sql` | app_periods (central period config) |
| `202603260002_sales_targets_lot_dates.sql` | Thêm cột lot_date vào sales_monthly_targets |
| `202603260003_sku_lot_dates.sql` | Bảng sku_lot_dates + seed 23 SKUs |

---

## 9. Cài đặt môi trường Dev

```bash
# 1. Clone repo
git clone https://github.com/dphung88/hb-execution-os.git
cd hb-execution-os

# 2. Cài packages
npm install

# 3. Tạo .env.local từ template
cp .env.example .env.local
# Điền các giá trị thật vào .env.local

# 4. Chạy SQL migrations trên Supabase Dashboard (theo thứ tự ở Section 8)

# 5. Khởi động dev server
npm run dev
# → http://localhost:3000
```

---

## 10. Deploy (Vercel)

1. Connect GitHub repo lên Vercel
2. Set tất cả env variables trong Vercel Dashboard > Project Settings > Environment Variables
3. Thêm Cron Job trong `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-sales",
      "schedule": "0 6 * * *"
    }
  ]
}
```
4. Push lên `main` → Vercel tự động deploy

---

## 11. Git Branches

| Branch | Mô tả |
|---|---|
| `main` | Production branch — luôn deployable |
| `backup/YYYY-MM-DD` | Snapshot backup theo ngày |

---

## 12. Roadmap / TODO đã biết

- [ ] **ERP Lot Date API:** IT đang build API trích xuất lot date từ ERP → khi có, update `lib/sales/sync.ts` để auto-populate `sku_lot_dates.lot_date`
- [ ] **Weekly sell-out:** Hiện tại = 0. Cần pull từ warehouse data khi IT cung cấp API
- [ ] **ASM list dynamic:** `demoSalesAsms` hiện hardcoded trong `lib/demo-data.ts` → nên chuyển vào DB table `sales_asms`
- [ ] **WhatsApp notifications:** Schema đã có, chưa implement gửi thật
- [ ] **Executive Briefs:** UI stub, chưa có nội dung
- [ ] **Meetings:** UI stub, chưa implement

---

*Tài liệu cập nhật lần cuối: 2026-03-27*
