# ADR-025: Automation Studio

## Decision
Use immutable versioned automation definitions with declarative triggers, shared rule conditions, allow-listed actions, and append-only execution records.

## Rationale
This design preserves tenant isolation, reproducibility, dry-run safety, and auditability while allowing domain adapters to execute side effects asynchronously.
