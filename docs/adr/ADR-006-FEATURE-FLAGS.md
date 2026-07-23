# ADR-006: Tenant Feature Flags

## Decision

Feature availability is represented by a stable catalog in application code and tenant-specific overrides in PostgreSQL.

## Rationale

A stable catalog prevents arbitrary client-created feature names while overrides enable controlled rollout, packaging, beta cohorts, and emergency disablement without deployment. Percentage metadata is stored now so deterministic user bucketing can be introduced without a schema change.
