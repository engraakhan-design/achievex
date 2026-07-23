# ADR-043 — Enterprise Knowledge Platform and RAG

## Decision
AchieveX will use a tenant-scoped knowledge bounded context for ingestion, chunking, embeddings, hybrid retrieval and citations. Copilot requests retrieve authorized context before calling the governed AI Gateway.

## Security
Every row includes `organizationId`. Retrieval applies tenant filtering before ranking and then enforces document visibility and allowed-user lists. Cross-tenant vector search is prohibited.

## Initial vector strategy
Sprint 16.3 ships a deterministic local embedding implementation stored as numeric arrays to keep the source runnable without external services. Production deployments may replace this behind the service boundary with pgvector or another approved vector store.

## Consequences
Responses can be grounded and cited. Index quality, deletion propagation, provider-backed embeddings and advanced record-level authorization remain operational responsibilities.
