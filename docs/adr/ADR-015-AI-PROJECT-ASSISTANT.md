# ADR-015: Evidence-grounded AI Project Assistant

## Status
Accepted

## Decision
Project AI capabilities use the shared AI provider abstraction and receive a bounded, tenant-scoped execution facts package assembled by the application. Generated plans and recommendations are advisory and require explicit human application.

A deterministic heuristic layer calculates baseline delivery-risk scores and mitigation candidates. The language model explains and structures those facts but is not the source of canonical project status, progress, budget, schedule, risk, or issue data.

## Consequences

- AI output is traceable to supplied execution evidence.
- Existing AI telemetry, cost tracking, prompt versioning, feature flags, and feedback are reused.
- No new database models are required.
- Mock mode supports offline development and predictable tests.
- Applying generated plans remains a separate, auditable workflow for a future sprint.
