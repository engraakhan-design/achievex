# ADR-014: Execution Analytics Read Model

## Status
Accepted

## Context
Executive reporting requires portfolio-level health, schedule, budget, risk, and milestone intelligence without coupling those calculations to project mutation workflows.

## Decision
Build an application-layer analytics read model from canonical Execution records. Pure calculation functions own variance, aggregation, and exposure scoring. API projections provide dashboard and executive-report shapes.

## Consequences
- Calculations remain explainable and testable.
- No analytics table or warehouse is required for the current scale.
- Read queries may become expensive at enterprise scale.
- A materialized projection or warehouse can later replace the query implementation without changing the public API contract.
