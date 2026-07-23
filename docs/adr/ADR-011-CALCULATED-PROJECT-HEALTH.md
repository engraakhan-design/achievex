# ADR-011: Calculated Project Health

## Status
Accepted

## Context
Manual project-health labels become stale and are easy to manipulate. AchieveX needs explainable delivery signals that can be recalculated from operational evidence.

## Decision
Project health is calculated from a deterministic score using overdue work, milestone delay, critical issues, high-exposure risks, schedule variance, budget variance, and missed target dates. The resulting health is persisted for filtering while the detailed score and signals are calculated on read.

## Consequences
- Executives receive consistent health labels.
- Every health result can be explained through its contributing signals.
- Thresholds can later become tenant configuration without changing project APIs.
- Manual health overrides are intentionally excluded from Sprint 10.2.
