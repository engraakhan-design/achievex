# ADR-027: Executive Dashboard Architecture
## Decision
Represent executive dashboards as tenant-owned definitions with an audience, reusable widgets, saved views and read-only resolution against metric snapshots.
## Rationale
This separates presentation from KPI calculation, preserves historical reproducibility and allows role-specific views without hard-coding operational queries into the web client.
## Consequences
Dashboards show null values until matching published metrics and snapshots exist. Predictive values remain outside this sprint.
