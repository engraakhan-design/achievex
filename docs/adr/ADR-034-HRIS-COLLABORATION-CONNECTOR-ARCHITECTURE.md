# ADR-034: HRIS and Collaboration Connector Architecture

## Decision
Use provider adapters and normalized enterprise objects. Keep HRIS synchronization, productivity data ingestion, and collaboration delivery separated by explicit domains and permissions. Persist idempotency keys and execution evidence.

## Consequences
Vendor payloads do not become domain models. Network behavior remains deployment-specific. Human and security governance is preserved.
