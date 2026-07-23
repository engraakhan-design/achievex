# Project & Initiative Management — Sprint 10.1

Sprint 10.1 establishes the Execution bounded context. It provides tenant-isolated portfolios, programs, projects, workstreams, milestones, tasks, project dependencies, risks, issues, and a unified execution activity stream.

## Rules
- Every write is scoped by organization.
- Project keys are unique per organization.
- Cross-project dependencies reject self-dependencies and cycles.
- Operational activity is recorded as both `ExecutionActivity` and a domain event.
- `execution.read` and `execution.manage` protect the API.

## API
Base route: `/api/v1/execution`. See Swagger for DTO schemas.

## Deliberate boundaries
Sprint 10.1 does not claim Gantt rendering, capacity planning, objective contribution calculations, comments, files, or external task synchronization. Those belong to later Milestone 10 sprints.

## Sprint 10.2 workflows

Portfolio, program, and project records now have API-connected creation workflows. Project detail responses include calculated health evidence and delivery variance. Project status changes use an explicit state machine, and delivery updates recalculate health automatically.

### Delivery calculations

- Schedule progress: elapsed percentage between start and target dates.
- Schedule variance: reported project progress minus schedule progress.
- Budget variance: actual cost minus approved budget.
- Budget variance percentage: budget variance divided by approved budget.

Health scoring incorporates these values together with overdue work, risks, and issues.

## Sprint 10.3 — Work Management

The Execution context now includes project Kanban boards, task detail views, hierarchy, comments, checklists, labels, attachment references, assignee filtering and cycle-safe in-project task dependencies. The design remains intentionally lighter than engineering issue trackers and emphasizes strategic delivery context.

## Sprint 10.4 — Strategy Traceability

Projects can now be linked explicitly to Objectives and Key Results. Each relationship records whether the project is direct, enabling, or supporting, its contribution weight, and an optional rationale.

The project traceability workspace shows weighted contribution, linked outcomes, completed-task context, upstream dependency exposure, and downstream projects. Objective traceability shows all direct and Key Result-level contributing projects with delivery health.

Delivery contribution is informative and does not overwrite canonical OKR progress.


## Sprint 10.5 — Portfolio Analytics

Implemented portfolio health aggregation, schedule and budget variance, risk heat maps, milestone forecasts, delivery trends, and executive portfolio reporting. See `docs/RELEASE_NOTES_M10_5.md`.

## Sprint 10.6 — AI Project Assistant

The project workspace includes an AI assistant for project-plan generation, delivery-risk analysis, mitigation recommendations, and project-health summaries. An executive update endpoint summarizes a portfolio or program from current execution facts. AI generations remain advisory and are stored through the shared AI governance and telemetry model.
