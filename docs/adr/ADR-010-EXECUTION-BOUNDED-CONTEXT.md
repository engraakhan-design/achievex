# ADR-010: Execution bounded context

## Decision
Model portfolios, programs, projects, and delivery work in an independent Execution bounded context. OKRs remain the source of strategic outcomes; a later contribution module will connect the two contexts explicitly.

## Consequences
Execution can evolve without overloading OKR aggregates. Cross-domain links must be explicit, tenant-safe, and event-aware.
