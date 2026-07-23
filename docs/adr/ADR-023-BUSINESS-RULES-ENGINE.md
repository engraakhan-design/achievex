# ADR-023: Declarative Business Rules Engine

## Decision
Use versioned JSON condition trees and an allow-listed action catalogue. Keep evaluation deterministic and action execution adapter-based.

## Consequences
Rules are auditable, tenant-isolated, safe to dry-run, and portable. Complex event processing and visual authoring are deferred.
