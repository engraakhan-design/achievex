# ADR-016: Resource Management Bounded Context

## Decision

Create Resource Management as a dedicated bounded context. Execution remains authoritative for projects and work. Resource Management is authoritative for people-as-capacity, skills, resource teams, calendars, and allocations.

## Rationale

Separating workforce planning from user administration and project delivery avoids overloading identity records and preserves clear ownership. A Resource may optionally reference a User but can also represent contractors and planned capacity.

## Consequences

- Tenant isolation is enforced on every relationship.
- Allocations reference projects/programs without owning them.
- Capacity calculations are deterministic and testable.
- Future planning read models can aggregate time-phased allocations without changing execution records.
