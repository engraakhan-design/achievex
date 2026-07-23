# ADR-013: Explicit Strategy-to-Execution Traceability

## Status
Accepted

## Context
Inferring strategic contribution from project names, teams, or portfolio placement is unreliable and difficult to audit. A project can contribute to several outcomes at different strengths.

## Decision
Use explicit tenant-scoped join entities between Projects and Objectives and between Projects and Key Results. Each link stores a contribution type, a weight from 0–100, and an optional rationale.

Effective contribution is calculated from current project progress and link weight. Aggregate delivery contribution is capped at 100 and remains separate from the canonical OKR progress calculation.

## Consequences

- Strategic relationships are explainable and auditable.
- Projects can support multiple outcomes without duplicating projects.
- OKR scoring remains independently governed.
- Users must maintain relationship weights deliberately.
- Future analytics can compare delivery contribution with actual outcome movement.
