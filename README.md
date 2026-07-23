# AchieveX

AchieveX is an enterprise strategy-execution platform combining OKRs, project and initiative management, portfolio analytics, resource planning, and governed AI assistance.

## Current implementation areas

- Enterprise identity and tenant administration
- AI Strategy Assistant
- Project and initiative management
- Strategy-to-execution traceability
- Portfolio analytics
- AI Project Assistant
- Resource management and capacity planning
- AI Resource Planner
- Enterprise scheduling

## Development

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Validation

```bash
npm run build
npm test
```

See `docs/ROADMAP.md`, release notes, and ADRs for implementation boundaries and architecture decisions.

## Milestone 11.5
Executive Workforce Analytics is available at `/resources/analytics`, with tenant-scoped workforce utilization, team workload, capability concentration, bottlenecks, bench, hiring signals, and cost forecasts.

### Milestone 12.1 — Workflow Engine Foundation

Versioned workflow definitions, deterministic transitions, runtime instances, human tasks, audit history, RBAC, APIs, and the `/workflows` workspace are included.

## Milestone 12 Sprint 12.2 — Enterprise Approval Engine

Adds reusable approval requests, ordered stages, single/sequential/parallel/majority/consensus/first-response strategies, immutable decisions, delegation, escalation, approval dashboards, RBAC, and `/workflows/approvals` and `/workflows/delegations` workspaces.


## Milestone 12 Sprint 12.3
Business Rules Engine: versioned definitions, deterministic conditions, controlled actions, dry-run evaluation, and audit history.


## Milestone 12.5 — Automation Studio
Versioned triggers, conditions, governed actions, dry runs, and execution history are available under `/workflows/automations`.


## Milestone 13
- Sprint 13.1: Enterprise Data Warehouse & Analytics Foundation (source integrated)

## Milestone 13.2 — Executive Dashboards
Role-based executive scorecards for CEO, COO, CFO, CHRO, PMO and Department Heads, including saved views, trend resolution and dimension drill-down APIs. See `docs/EXECUTIVE_DASHBOARDS.md`.


## Milestone 13 Sprint 13.3
Predictive analytics foundation with governed model versions, transparent forecasting, confidence scores, explanations, and auditable prediction runs.

## Milestone 13.4
Decision Intelligence with governed recommendations, evidence, simulations, and human disposition.

## Milestone 16 Sprint 16.3

Enterprise Knowledge Platform and RAG source foundation: tenant-scoped sources and documents, chunking, deterministic embeddings, hybrid retrieval, citations, query audit, administration UI, and Copilot grounding. See `docs/RELEASE_NOTES_M16_3.md` and ADR-043.

## Milestone 17 Sprint 17.4
Team Workspaces and Communities of Practice are available at `/workspaces` and `/communities`.
