# Release Notes — Milestone 11, Sprint 11.5

## Executive Workforce Analytics

Sprint 11.5 adds a tenant-scoped workforce analytics read model and dashboard covering utilization, team workload, skills concentration, resource bottlenecks, bench capacity, hiring signals, and allocation-cost forecasts.

### APIs

- `GET /api/v1/resource-management/analytics/workforce`
- `GET /api/v1/resource-management/analytics/executive-report`

Both support `from`, `to`, `teamId`, and display-currency parameters and require `resources.read`.

### User experience

The new `/resources/analytics` workspace provides executive metrics, a bottleneck attention list, team rollups, scarce-skill coverage, hiring signals, and bench opportunities.

### Governance

Analytics are calculated from canonical Resources, Skills, Teams, Allocations, and cost rates. No staffing or hiring decision is applied automatically. Missing cost rates contribute zero and are not estimated.

### Database impact

No new tables or migration are required. The sprint uses a calculated read model that can later be materialized without changing the public API.
