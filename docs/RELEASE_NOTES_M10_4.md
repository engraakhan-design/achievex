# Milestone 10 — Sprint 10.4 Release Notes

## Strategy Traceability

Sprint 10.4 connects the Execution and OKR bounded contexts through explicit, tenant-owned links. Projects can support Objectives and Key Results with a relationship type, percentage weight, and rationale.

### Delivered

- Project-to-Objective links
- Project-to-Key Result links
- Direct, enabling, and supporting relationship types
- Weighted effective contribution calculations
- Objective and Key Result delivery rollups
- Dependency exposure in project traceability
- Bidirectional project and objective navigation
- Strategy catalog API
- Traceability management UI
- Audit/activity and domain events for link changes
- Tenant validation and duplicate-link protection

### Contribution rule

`effective contribution = project progress × link weight / 100`

Rollup values are capped at 100%. They are delivery signals, not automatic mutations of the canonical OKR score.

### Events

- `strategy.objective_linked`
- `strategy.objective_unlinked`
- `strategy.key_result_linked`
- `strategy.key_result_unlinked`
