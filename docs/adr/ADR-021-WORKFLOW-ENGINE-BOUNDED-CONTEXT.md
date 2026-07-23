# ADR-021 — Workflow Engine Bounded Context

## Status
Accepted

## Context
AchieveX needs approvals and cross-domain process orchestration without moving ownership of projects, OKRs, resources, budgets, or risks into a central workflow database.

## Decision
Create a dedicated Workflow bounded context with versioned definitions and immutable published versions. Runtime instances reference the exact version used at startup. The engine evaluates deterministic transitions from tenant-scoped variables, creates human tasks for waiting steps, and records an append-only history.

Domain records remain authoritative in their existing modules. Workflows refer to them through `entityType`, `entityId`, and domain events.

## Consequences
- Running instances are stable when definitions evolve.
- Workflow execution is auditable and reproducible.
- Cross-domain orchestration does not create ownership ambiguity.
- Approval, SLA, rules, notifications, and Automation Studio can build on one engine.
- Automatic action executors need retry, idempotency, and dead-letter handling in later sprints.
