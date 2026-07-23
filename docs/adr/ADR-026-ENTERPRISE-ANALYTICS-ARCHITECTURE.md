# ADR-026: Enterprise Analytics Architecture

## Decision
Create a tenant-scoped, read-optimized analytics bounded context with immutable metric versions, time-series snapshots, generic facts, idempotent aggregation jobs, and dashboard definitions. Operational modules remain systems of record.

## Rationale
Stable KPI definitions and historical reproducibility are prerequisites for executive dashboards, forecasting, and decision intelligence. Formula execution is allow-listed; arbitrary code and SQL are excluded.
