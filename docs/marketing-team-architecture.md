# Marketing Team Architecture

## Goal

Build `Marketing Team` as one operating module that combines:

- `Team Results`
- `Person KPI`
- `Task Tracking`

This keeps daily execution, KPI scoring, and department-level sales performance in one system instead of splitting them across separate Excel files.

## Source Workbooks Mapped

### `Healthy Beauty KPIs Tracking 2025.xlsx`

Primary business meaning:

- monthly sales revenue target vs actual
- expense budget target vs actual
- headcount planned vs actual
- role-based KPI output
- platform / channel contribution
- person-level marketing performance

### `To-do Tracking Executive.xlsx`

Primary business meaning:

- task ownership by person
- weekly / monthly work schedule
- priority
- requester
- status
- progress
- due dates
- result / note
- file or cloud reference
- dashboard summary of task execution

## Recommended Product Structure

Use one `Marketing Team` menu with four submenus:

1. `Dashboard`
2. `Tasks`
3. `KPIs`
4. `Results`

### `Dashboard`

Purpose:

- VP / COO overview of department health
- team sales target vs actual
- budget usage
- headcount readiness
- overdue tasks
- KPI health by person

### `Tasks`

Purpose:

- daily operating workspace for the team
- direct replacement for `To-do Tracking Executive.xlsx`

### `KPIs`

Purpose:

- KPI setup by role
- person-level KPI target, actual, ratio, score
- manager review and monthly scoring

### `Results`

Purpose:

- department-level sales and budget outcomes
- role and channel contribution
- monthly summary and accountability view

## Operating Logic

Marketing should run on three linked layers.

### Layer 1: Team Results

Examples:

- team sales revenue
- expense budget
- actual budget
- headcount fill rate
- revenue by channel

This is the department-level result layer.

### Layer 2: Person KPI

Examples:

- Digital Marketer KPI
- E-Com Operations KPI
- Content Creator KPI
- Designer KPI
- Editor KPI
- AI Officer KPI

This is the role-based performance layer.

### Layer 3: Task Tracking

Examples:

- daily tasks
- weekly deliverables
- overdue items
- progress %
- results note

This is the execution layer.

## Core Business Rule

`Task completion` should influence `Person KPI`, but should not replace KPI.

Use:

- `Outcome KPI` = sales / budget / output / channel performance
- `Execution KPI` = task completion / deadline discipline / work quality

Suggested weighting:

- `60%` outcome KPI
- `40%` execution KPI

This prevents inflated performance scores from high activity but weak results.

## Role-Based KPI Model

### Digital Marketer

- budget execution
- channel sales contribution
- campaign deployment completion
- task completion

### E-Com Operations

- platform sales result
- channel execution completion
- listing / storefront / ops completion
- task completion

### Content Creator

- content output count
- approved content rate
- on-time delivery
- task completion

### Designer

- design delivery count
- revision efficiency
- on-time delivery
- task completion

### Editor

- edited asset count
- turnaround time
- on-time delivery
- task completion

### AI Officer

- automation / support output
- experiment delivery
- process enablement completion
- task completion

## Page Structure

### `/marketing-performance`

Dashboard page.

Blocks:

- `TEAM SALES REVENUE`
- `ACTUAL BUDGET`
- `HEADCOUNT STATUS`
- `TASK COMPLETION`
- `REVENUE BY CHANNEL`
- `KPI SCORE BY MEMBER`
- `AT-RISK TASKS`

### `/marketing-performance/tasks`

Primary execution page.

Views:

- all tasks
- by owner
- by status
- by requester
- overdue
- due this week

Actions:

- create task
- update progress
- add result note
- attach cloud link

### `/marketing-performance/kpis`

Primary scoring page.

Views:

- KPI setup by role
- KPI result by person
- KPI coverage by month
- manager review status

Actions:

- define KPI target
- adjust weight
- finalize monthly score

### `/marketing-performance/results`

Primary results page.

Views:

- team revenue target vs actual
- budget target vs actual
- role contribution
- channel contribution
- final monthly summary

## UX Behavior

### Dashboard behavior

- leadership-first layout
- month selector at top
- team result cards first
- people and task sections below

### Tasks behavior

- row-based task table for speed
- quick edit status and progress
- result note and file link visible inline
- filters by owner / status / requester / priority

### KPI behavior

- split between `Team KPI` and `Person KPI`
- each KPI row shows target, actual, ratio, score
- score explanation visible inline

### Results behavior

- clean monthly summary
- channel table
- role table
- team score block

## Integration Logic

### Task -> KPI

Inputs from tasks:

- task completion count
- overdue count
- average progress
- deadline compliance

These feed the `Execution KPI` part of each person score.

### Team sales -> KPI

Inputs from marketing results:

- sales revenue target
- sales revenue actual
- budget target
- budget actual
- channel performance

These feed:

- department result cards
- role KPI outcome inputs
- final team performance summary

## Data Ownership

### Manual inputs

- tasks
- progress %
- result notes
- KPI targets
- manager score / comments

### Imported / synced inputs later

- actual sales revenue
- actual budget
- channel / platform revenue

## Recommended Build Order

1. `Marketing Tasks`
2. `Marketing Results`
3. `Marketing KPI Setup`
4. `Marketing KPI Scoring`
5. `Marketing Dashboard Roll-up`

## MVP Recommendation

For the first real Marketing module build:

- keep `Tasks` as the main daily workspace
- keep `Results` as the department score layer
- keep `KPIs` as a role-based monthly scoring layer

That gives a clean flow:

`Tasks -> KPI scoring -> Department results -> Dashboard`
