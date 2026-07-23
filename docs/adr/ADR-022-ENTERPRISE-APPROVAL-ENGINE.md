# ADR-022: Enterprise Approval Engine

## Decision
Implement approvals inside the Workflow bounded context as tenant-scoped requests, ordered stages, assignments, immutable decisions, delegations, and escalations. Strategy evaluation is deterministic and isolated from transport/UI.

## Consequences
Running approvals retain complete decision history. Sequential stages activate one at a time; parallel, majority, consensus, single, and first-response strategies share one evaluator. Delegation is resolved when assignments are created, while escalation records remain append-only.
