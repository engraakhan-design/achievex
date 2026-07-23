# ADR-019: Reversible Enterprise Scheduling

## Status
Accepted

## Context
Resource planners need to move work across people and dates while understanding leave, calendars, time zones, and conflicts. Direct drag-and-drop persistence makes accidental staffing changes difficult to review and audit.

## Decision
AchieveX separates scheduling into two operations:

1. **Preview** proposed changes against current allocations and calculate conflict deltas without persistence.
2. **Commit** a single guarded allocation change through a tenant-scoped reschedule endpoint.

Working calendars, holiday calendars, and availability exceptions remain authoritative availability inputs. Allocations remain canonical staffing commitments.

## Consequences
- Scenario exploration is reversible and safe.
- Allocation changes are auditable domain events.
- The UI can support drag-and-drop without embedding business rules in the browser.
- Multi-change scenario commits and approval workflows can be introduced later without changing the read model.
