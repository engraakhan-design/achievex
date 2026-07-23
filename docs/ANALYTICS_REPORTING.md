# Analytics, Reporting, and Alignment

Milestone 5 introduces an executive analytics read model over the core OKR domain.

## Capabilities

- Executive scorecard with progress, completion, risk, and check-in coverage
- Risk detection for overdue, off-track, low-confidence, and stale objectives
- Objective alignment tree for company-to-individual strategy tracing
- Weekly key-result progress trend
- Check-in health by owner
- Breakdown by scope, department, team, or owner
- Tenant-scoped CSV export

## API

- `GET /api/v1/analytics/executive`
- `GET /api/v1/analytics/alignment`
- `GET /api/v1/analytics/progress-trend`
- `GET /api/v1/analytics/check-in-health`
- `GET /api/v1/analytics/breakdown`
- `GET /api/v1/analytics/export.csv`

All endpoints require `okrs.read` and derive the organization from the authenticated user.

## Current risk rules

An objective can surface as a priority risk when it is explicitly at risk/off track, contains a low-confidence key result, is overdue before completion, or has stale check-in activity. These deterministic rules are intentionally explainable and form the baseline for future AI risk forecasting.
