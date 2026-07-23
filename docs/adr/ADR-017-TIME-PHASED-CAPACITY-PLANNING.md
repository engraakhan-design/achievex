# ADR-017 — Time-Phased Capacity Planning

## Status
Accepted

## Context
A single current utilization percentage cannot support staffing decisions. Capacity changes over time because allocations, holidays, leave, and calendars have different effective dates.

## Decision
AchieveX calculates capacity as a time-phased read model. Weekly or monthly periods are derived from working calendars, holiday calendars, availability exceptions, and overlapping allocations. The calculation is implemented as pure functions and assembled by the Resource Management service.

Allocation records remain canonical. Forecast results are calculated on demand and do not mutate allocations.

## Consequences

- Forecasts are explainable and independently testable.
- Calendar changes affect future projections without rewriting allocations.
- Large tenants may later require cached or materialized capacity read models.
- Time-zone-aware partial-day handling can be added without changing API consumers.
