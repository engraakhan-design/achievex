# Enterprise Analytics Foundation

Sprint 13.1 adds a versioned metrics catalog, deterministic KPI engine, snapshots, generic facts, aggregation jobs, and dashboard definitions.

Supported calculations: count, sum, average, min, max, percentage, ratio, weighted score, and allow-listed arithmetic formulas. Published metric versions are immutable in application behavior. Analytics records are organization-scoped.

The aggregation endpoint currently records an auditable job envelope. Production ETL workers and domain event consumers should populate facts and execute bulk rollups asynchronously.
