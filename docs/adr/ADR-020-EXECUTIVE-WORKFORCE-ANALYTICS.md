# ADR-020: Calculated Executive Workforce Analytics

## Status
Accepted

## Context
Executives need a consolidated view of capacity, utilization, cost, skills, bottlenecks, and bench. These measures are derived from operational records and should not become competing sources of truth.

## Decision
AchieveX will initially calculate workforce analytics as a tenant-scoped read model from Resources, Resource Teams, Skills, and overlapping Resource Allocations.

The read model will:

- use explicit date horizons;
- expose the evidence behind classifications;
- classify bench below 25%, underutilization below 60%, and overallocation above 100%;
- identify capability concentration using advanced/expert coverage;
- calculate costs only when an explicit resource cost rate exists;
- keep hiring signals advisory;
- avoid persisting derived executive classifications.

## Consequences
The implementation is deterministic and testable, and operational records remain canonical. Larger tenants may later use an event-fed materialized view or warehouse while preserving API semantics.
