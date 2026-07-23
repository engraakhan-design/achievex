# Sprint 10.5 — Portfolio Analytics

Sprint 10.5 adds executive delivery intelligence across the Execution bounded context.

## Capabilities

- Tenant-scoped portfolio analytics dashboard
- Portfolio and program filters
- Aggregated project health and progress
- Schedule variance and budget variance rollups
- Risk probability/impact heat map
- Ranked risk exposure
- Overdue and upcoming milestone forecast
- Six-month projects-due versus projects-completed trend
- Executive report projection and decision-attention list
- Portfolio performance comparison

## API

- `GET /api/v1/execution/analytics/dashboard`
- `GET /api/v1/execution/analytics/portfolios/:id`
- `GET /api/v1/execution/analytics/executive-report`

Dashboard filters support `portfolioId`, `programId`, `from`, and `to`.

## UI

- `/execution/analytics`

## Design constraints

Analytics are calculated from canonical execution records. No separate reporting copy is introduced in this sprint. Project health remains explainable and portfolio rollups do not overwrite project-level health.
