# ADR-041 — Enterprise AI Platform Architecture

## Decision
All AchieveX domains consume AI through a centralized, tenant-aware gateway. Provider credentials remain references to the existing secret infrastructure. Prompt assets are versioned and publishable; execution metadata is auditable and cost-accounted. Provider transports are adapter-based and deployment-specific.

## Consequences
Business modules remain provider-independent. Content retention is opt-in. External provider network calls are not enabled by the foundation stub.
