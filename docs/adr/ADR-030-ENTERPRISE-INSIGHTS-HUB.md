# ADR-030: Enterprise Insights Hub

## Status
Accepted

## Decision
Create a read-oriented, tenant-scoped insight projection that unifies evidence from analytics, predictions and recommendations without modifying source records.

## Rationale
Executives need one prioritized attention stream, but source provenance, human accountability and domain ownership must remain explicit.

## Consequences
- Insights are projections and may be refreshed idempotently.
- Source type and source identifier preserve traceability.
- Acknowledgements are append-only.
- Operational actions remain outside the hub.
- Notification delivery is delegated to the existing routing infrastructure.
