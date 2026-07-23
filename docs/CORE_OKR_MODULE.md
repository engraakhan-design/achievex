# Core OKR Module

Milestone 4 introduces the strategy execution domain.

## Capabilities

- Quarterly, annual, and custom OKR cycles
- Company, department, team, and individual objectives
- Parent-child objective alignment
- Numeric, percentage, currency, boolean, and milestone key results
- Weighted objective progress and 0.0–1.0 scoring
- Manual check-ins with confidence, status, notes, and history
- Key-result initiatives
- Objective comments and immutable activity history
- Tenant-scoped dashboard metrics
- Responsive OKR workspace, cycle management, and objective details

## Progress formula

For measurable key results, progress is clamped to 0–100:

`((currentValue - startValue) / (targetValue - startValue)) * 100`

Objective progress is the weighted average of its key results. Objective score is progress divided by 100.

## Security

Every query is scoped by `organizationId` from the authenticated access token. Cross-tenant owners, cycles, parents, teams, and departments are rejected.

## API

All endpoints are under `/api/v1/okrs`. Read operations require `okrs.read`; mutations require `okrs.manage`.
