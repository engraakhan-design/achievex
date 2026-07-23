# Milestone 10 · Sprint 10.2 — Portfolio, Program & Project Workflows

Sprint 10.2 turns the execution-domain foundation into an operational project-delivery workspace.

## Delivered

- API-connected portfolio, program, and project workflows.
- Project creation with owner, sponsor, strategic placement, priority, dates, and budget.
- Tenant-safe portfolio/program detail and update endpoints.
- Guarded project status transitions.
- Automatic project health calculation.
- Schedule progress and variance calculations.
- Budget variance and cost-overrun calculations.
- Project detail workspace with milestones, tasks, risks, issues, activity, and delivery controls.
- Manual health recalculation endpoint for administrative diagnostics.
- Unit coverage for the health-scoring rules.

## Health model

The calculated health score considers overdue milestones, overdue tasks, unresolved critical issues, high-probability/high-impact risks, schedule-progress gaps, budget overruns, and missed target dates. Scores map to `ON_TRACK`, `AT_RISK`, and `OFF_TRACK`.

## Status workflow

- Draft → Planned or Cancelled
- Planned → Active, On Hold, or Cancelled
- Active → On Hold, Completed, or Cancelled
- On Hold → Active or Cancelled
- Completed and Cancelled are terminal

## Deferred to later Sprint 10 work

Kanban interaction, comments, attachments, resource capacity, strategic OKR contribution, Gantt/roadmap visualization, portfolio forecasting, and AI project planning remain outside Sprint 10.2.
