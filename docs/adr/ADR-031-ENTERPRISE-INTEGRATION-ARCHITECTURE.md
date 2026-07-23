# ADR-031: Enterprise Integration Architecture

AchieveX uses a tenant-scoped integration bounded context with versioned connector definitions, installed instances, write-only credentials, auditable executions, health snapshots, standardized domain-event envelopes and HMAC webhooks. Connectors implement a common SDK contract. Operational domains publish events and do not depend on connector implementations. Retries are bounded and failed executions move to a dead-letter state. No read API returns credential material.
