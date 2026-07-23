# ADR-048 — Enterprise Documents and Knowledge Authoring

## Decision
AchieveX will use immutable document versions, explicit review assignments, independent approval, and controlled publication into the tenant-isolated Knowledge Platform.

## Consequences
Published content is traceable to an approved version. Draft editing never mutates prior versions. Retrieval uses the existing Sprint 16.3 indexing and permission boundary. Real-time character-level CRDT co-authoring is deferred; Sprint 17.3 supplies durable version and workflow semantics that Sprint 17.4+ can synchronize.
